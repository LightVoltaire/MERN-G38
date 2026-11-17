import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getSession } from '../utils/session';
import type { CartItem } from '../types/shop';

export default function CartPage() {
  const session = getSession();
  const userId = session?.userId ?? '';
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutMsg, setCheckoutMsg] = useState('');

  const fetchCart = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/cart/${userId}`);
      if (res.ok) {
        const data: CartItem[] = await res.json();
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const handleRemove = async (figureId: string) => {
    await fetch(`${apiBase}/api/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, figureId }),
    });
    await fetchCart();
  };

  const handleCheckout = async () => {
    const res = await fetch(`${apiBase}/api/cart/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setCheckoutMsg(data.message || 'Purchase completed!');
    setItems([]);
  };

  const totalCost = items.reduce((sum, item) => sum + item.figure.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Navbar cartCount={totalCount} />

      <main className="app-container flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 fw-bold mb-0">
            <i className="bi bi-cart3 me-2 text-primary"></i>
            Your Shopping Cart
          </h1>
          <Link to="/home" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Catalogue
          </Link>
        </div>

        {checkoutMsg && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {checkoutMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 text-muted">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-muted mb-3">Your shopping cart is empty.</p>
            <div>
              <Link to="/home" className="btn btn-primary">
                Browse Action Figures
              </Link>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="list-group list-group-flush">
              {items.map(({ figure, quantity }) => (
                <div
                  key={figure._id}
                  className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-3 py-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={`${apiBase}${figure.imageUrl}`}
                      alt={figure.name}
                      className="bg-white border rounded p-1"
                      style={{ width: '68px', height: '68px', objectFit: 'contain' }}
                    />
                    <div>
                      <h6 className="mb-1 fw-bold">{figure.name}</h6>
                      <small className="text-muted">
                        {figure.manufacturer} • {figure.category} • Qty: {quantity}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="fs-6 fw-bold">${(figure.price * quantity).toFixed(2)}</span>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemove(figure._id)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
              <h4 className="mb-0 fw-bold">Total: ${totalCost.toFixed(2)}</h4>
              <button type="button" className="btn btn-success btn-lg" onClick={handleCheckout}>
                <i className="bi bi-bag-check-fill me-2"></i>
                Complete Purchase
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
