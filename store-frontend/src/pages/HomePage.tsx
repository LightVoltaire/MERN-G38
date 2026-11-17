import { useState, useEffect, type FormEvent } from 'react';
import Navbar from '../components/Navbar';
import FigureCard from '../components/FigureCard';
import type { Figure, CartItem } from '../types/shop';
import { getSession } from '../utils/session';

export default function HomePage() {
  const [figures, setFigures] = useState<Figure[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Anime');
  const [stock, setStock] = useState('1');
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000').replace(/\/$/, '');
  const userId = getSession()?.userId ?? '';

  const loadFigures = async () => {
    const params = new URLSearchParams({ search, category });
    const response = await fetch(`${apiBase}/api/figures?${params}`);
    if (response.ok) setFigures(await response.json());
  };

  const loadCartCount = async () => {
    if (!userId) return;
    const response = await fetch(`${apiBase}/api/cart/${encodeURIComponent(userId)}`);
    if (response.ok) {
      const items: CartItem[] = await response.json();
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
  };

  useEffect(() => {
    void loadFigures();
    void loadCartCount();
  }, [search, category]);

  const handleAddToCart = async (figureId: string) => {
    const response = await fetch(`${apiBase}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, figureId }),
    });
    if (response.ok) {
      await loadFigures();
      await loadCartCount();
    } else {
      const error = await response.json();
      alert(error.error || 'Could not add item.');
    }
  };

  const handleListFigure = async (event: FormEvent) => {
    event.preventDefault();
    if (!pngFile) return;
    const formData = new FormData();
    formData.append('name', name);
    formData.append('manufacturer', manufacturer);
    formData.append('price', price);
    formData.append('category', newCategory);
    formData.append('stock', stock);
    formData.append('userId', userId);
    formData.append('image', pngFile);

    const response = await fetch(`${apiBase}/api/figures`, { method: 'POST', body: formData });
    if (response.ok) {
      setName(''); setManufacturer(''); setPrice(''); setStock('1'); setPngFile(null);
      setUploadMsg('Figure listed in the grand repository!');
      await loadFigures();
    } else {
      const error = await response.json();
      setUploadMsg(error.error || 'Failed to upload figure.');
    }
  };

  return <>
    <Navbar cartCount={cartCount} />
    <div className="container pb-5">
      <div className="row g-2 mb-4">
        <div className="col-md-8"><input type="text" className="form-control" placeholder="Search action figures by name or manufacturer..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="col-md-4"><select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}><option value="All">All Categories</option><option value="Anime">Anime</option><option value="Marvel">Marvel</option><option value="DC">DC</option><option value="Mecha">Mecha</option><option value="Video Games">Video Games</option><option value="Retro">Retro</option></select></div>
      </div>
      <div className="card mb-4 border-dark">
        <div className="card-header bg-dark text-white fw-semibold">+ List Your Action Figure in the Repository</div>
        <div className="card-body">
          <form onSubmit={handleListFigure} className="row g-3">
            <div className="col-md-3"><input className="form-control" placeholder="Figure Name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="col-md-2"><input className="form-control" placeholder="Manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required /></div>
            <div className="col-md-2"><input type="number" step="0.01" className="form-control" placeholder="Price ($)" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
            <div className="col-md-2"><select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}><option value="Anime">Anime</option><option value="Marvel">Marvel</option><option value="DC">DC</option><option value="Mecha">Mecha</option><option value="Video Games">Video Games</option><option value="Retro">Retro</option></select></div>
            <div className="col-md-1"><input type="number" min="1" className="form-control" title="Quantity available" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
            <div className="col-md-2"><input type="file" accept="image/png" className="form-control" onChange={(e) => setPngFile(e.target.files?.[0] ?? null)} required /></div>
            <div className="col-12 d-flex justify-content-between align-items-center"><small className="text-muted">Upload a transparent or crisp .PNG image of your figure.</small><button type="submit" className="btn btn-success">Publish Listing</button></div>
          </form>
          {uploadMsg && <div className="alert alert-info mt-3 mb-0 py-2">{uploadMsg}</div>}
        </div>
      </div>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">{figures.map((figure) => <div className="col" key={figure._id}><FigureCard figure={figure} onAddToCart={handleAddToCart} /></div>)}</div>
    </div>
  </>;
}
