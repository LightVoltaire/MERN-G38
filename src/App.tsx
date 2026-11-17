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

function normalizeFigure(doc) {
  return {
    ...doc,
    imageUrl: doc.imageUrl || doc.image || '',
    stock: doc.stock !== undefined ? Number(doc.stock) : 1
  };
}

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const resolvedFirstName = (firstName || 'User').trim();
    const resolvedLastName = (lastName || 'Account').trim();
    const resolvedEmail = (email || `${username.trim()}@example.com`).trim();

    const db = client.db('FigurinesDB');
    const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email: resolvedEmail }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({
      id: result.insertedId,
      userId: result.insertedId,
      username,
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
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
      userId: user._id,
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

// ... keep the rest of the existing server routes unchanged ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
