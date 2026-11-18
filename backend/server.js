const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Ensure uploads directory exists and serve uploaded PNGs statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname) || '.png'}`);
  }
});
const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongoose connected to MongoDB Atlas'))
  .catch(err => console.error('Mongoose Connection Error:', err));

const client = new MongoClient(process.env.MONGO_URI);
client.connect()
  .then(() => console.log('MongoClient connected to MongoDB Atlas: FigurinesDB'))
  .catch(err => console.error('MongoClient Connection Error:', err));

// Helper to normalize older DB records so frontend always gets imageUrl & stock
function normalizeFigure(doc) {
  return {
    ...doc,
    imageUrl: doc.imageUrl || doc.image || '',
    stock: doc.stock !== undefined ? Number(doc.stock) : 1
  };
}

// ==================== AUTH ROUTES ====================

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'All fields (username, password, firstName, lastName, email) are required' });
    }

    const db = client.db('FigurinesDB');
    const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({
      id: result.insertedId,
      username,
      firstName,
      lastName,
      email,
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = client.db('FigurinesDB');
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      error: ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ==================== FIGURE CATALOG ROUTES ====================

// GET /api/figures?search=...&category=...
app.get('/api/figures', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { manufacturer: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const db = client.db('FigurinesDB');
    const figures = await db.collection('figurines').find(filter).toArray();
    res.status(200).json(figures.map(normalizeFigure));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching figurines' });
  }
});

// POST /api/figures (Supports multipart FormData PNG upload AND raw JSON payloads)
app.post('/api/figures', upload.single('image'), async (req, res) => {
  try {
    const { name, manufacturer, price, category, stock, userId, description } = req.body;
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.imageUrl || req.body.image || '');

    if (!name || !manufacturer || price === undefined || !category || !imageUrl) {
      return res.status(400).json({ error: 'All fields (name, manufacturer, price, category, image) are required' });
    }

    const newFig = {
      name,
      manufacturer,
      price: Number(price),
      category,
      imageUrl,
      image: imageUrl,
      stock: stock !== undefined ? Number(stock) : 1,
      ...(description ? { description } : {}),
      ...(userId ? { userId } : {})
    };

    const db = client.db('FigurinesDB');
    const result = await db.collection('figurines').insertOne(newFig);
    res.status(201).json(normalizeFigure({ _id: result.insertedId, ...newFig }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during figurine add' });
  }
});

// Legacy alias kept so your co-API dev's /api/addfig tests continue working
app.post('/api/addfig', async (req, res) => {
  try {
    const { name, description, category, image, imageUrl, manufacturer, price, stock } = req.body;
    const resolvedImage = imageUrl || image;

    if (!name || !category || !resolvedImage || !manufacturer || price === undefined) {
      return res.status(400).json({ error: 'All fields (name, category, image, manufacturer, price) are required' });
    }

    const newFig = {
      name,
      description: description || '',
      category,
      image: resolvedImage,
      imageUrl: resolvedImage,
      manufacturer,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 1
    };

    const db = client.db('FigurinesDB');
    const result = await db.collection('figurines').insertOne(newFig);
    res.status(201).json({ id: result.insertedId, message: 'Figurine added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during figurine add' });
  }
});

// ==================== SHOPPING CART ROUTES ====================

// Helper to build CartItem[] expected by CartPage.tsx and HomePage.tsx
async function buildPopulatedCart(db, userId) {
  const cart = await db.collection('carts').findOne({ userId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return [];
  }

  const populated = [];
  for (const item of cart.items) {
    if (!ObjectId.isValid(item.figureId)) continue;
    const fig = await db.collection('figurines').findOne({ _id: new ObjectId(item.figureId) });
    if (fig) {
      populated.push({
        figure: normalizeFigure(fig),
        quantity: item.quantity
      });
    }
  }
  return populated;
}

// GET /api/cart/:userId
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = client.db('FigurinesDB');
    const items = await buildPopulatedCart(db, userId);
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

// POST /api/cart/add
app.post('/api/cart/add', async (req, res) => {
  try {
    const { userId, figureId } = req.body;
    if (!userId || !figureId) {
      return res.status(400).json({ error: 'userId and figureId are required' });
    }
    if (!ObjectId.isValid(figureId)) {
      return res.status(400).json({ error: 'Invalid figureId' });
    }

    const db = client.db('FigurinesDB');
    const figure = await db.collection('figurines').findOne({ _id: new ObjectId(figureId) });
    if (!figure) {
      return res.status(404).json({ error: 'Figurine not found' });
    }

    const currentStock = figure.stock !== undefined ? Number(figure.stock) : 1;
    if (currentStock <= 0) {
      return res.status(400).json({ error: 'This figure is out of stock' });
    }

    // Decrement stock in catalogue so HomePage greys out 0-stock items
    await db.collection('figurines').updateOne(
      { _id: new ObjectId(figureId) },
      { $set: { stock: currentStock - 1 } }
    );

    const cart = await db.collection('carts').findOne({ userId });
    if (!cart) {
      await db.collection('carts').insertOne({
        userId,
        items: [{ figureId, quantity: 1 }]
      });
    } else {
      const existingIndex = cart.items.findIndex(i => i.figureId === figureId);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += 1;
      } else {
        cart.items.push({ figureId, quantity: 1 });
      }
      await db.collection('carts').updateOne(
        { userId },
        { $set: { items: cart.items } }
      );
    }

    const updatedCart = await buildPopulatedCart(db, userId);
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error adding to cart' });
  }
});

// POST /api/cart/remove
app.post('/api/cart/remove', async (req, res) => {
  try {
    const { userId, figureId } = req.body;
    if (!userId || !figureId) {
      return res.status(400).json({ error: 'userId and figureId are required' });
    }

    const db = client.db('FigurinesDB');
    const cart = await db.collection('carts').findOne({ userId });
    if (!cart) {
      return res.status(200).json([]);
    }

    const removedItem = cart.items.find(i => i.figureId === figureId);
    const remainingItems = cart.items.filter(i => i.figureId !== figureId);

    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: remainingItems } }
    );

    // Restore stock when removed from cart without purchasing
    if (removedItem && ObjectId.isValid(figureId)) {
      await db.collection('figurines').updateOne(
        { _id: new ObjectId(figureId) },
        { $inc: { stock: removedItem.quantity } }
      );
    }

    const updatedCart = await buildPopulatedCart(db, userId);
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error removing from cart' });
  }
});

// POST /api/cart/checkout
app.post('/api/cart/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const db = client.db('FigurinesDB');
    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Purchase completed! Thank you for shopping at Secret Shop.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during checkout' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
