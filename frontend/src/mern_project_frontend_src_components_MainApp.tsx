import React, { useState, useEffect } from 'react';

interface ContactItem {
  _id: string;
  name: string;
  type: string;
  detail?: string;
}

interface MainAppProps {
  user: { id: string; name: string };
  onLogout: () => void;
}

const catalogData = [
  { name: 'Cyber Rogue', type: 'Figure', desc: '1/12 articulated operative with accessories.', icon: '🦸' },
  { name: 'Astra Heavy Mech', type: 'Model', desc: '1/100 snap-fit multi-colored armor kit.', icon: '🤖' },
  { name: 'Galactic Cruiser V2', type: 'Model', desc: 'Display starship with translucent thrusters.', icon: '🚀' },
  { name: 'Valkyrie Blade Unit', type: 'Figure', desc: 'Chrome collectible heroine with flight wings.', icon: '🦸‍♀️' },
  { name: 'Titan Recon Walker', type: 'Model', desc: 'Robotic exploration kit with dual pilots.', icon: '🦾' },
  { name: 'Retro Neon Android', type: 'Figure', desc: 'Posable metallic android with energy sabers.', icon: '⚡' }
];

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [shelf, setShelf] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('Figure');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchShelf = async () => {
    try {
      const res = await fetch(`/api/contacts/${user.id}`);
      const data = await res.json();
      if (res.ok) setShelf(data.results || []);
    } catch {
      setFeedback('Failed to load shelf records.');
    }
  };

  useEffect(() => {
    fetchShelf();
  }, [user.id]);

  const handleAddItem = async (name: string, type: string, detail: string = '') => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name, type, detail })
      });
      if (res.ok) {
        setFeedback(`"${name}" added to shelf!`);
        fetchShelf();
      }
    } catch {
      setFeedback('Could not save item.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback('Item removed.');
        setShelf((prev) => prev.filter((item) => item._id !== id));
      }
    } catch {
      setFeedback('Could not delete item.');
    }
  };

  const filteredCatalog = catalogData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.desc.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ background: '#faf9fd', minHeight: '100vh' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #eeedf3', padding: '16px 4%' }}>
        <div style={{ maxWidth: 1180, margin: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="brand">Secret <span>Shop</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '0.9rem', color: '#69697c' }}>Signed in as <strong style={{ color: '#24243a' }}>{user.name}</strong></span>
            <button
              onClick={onLogout}
              style={{ padding: '8px 14px', border: '1px solid #e6e2f5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: '32px auto', padding: '0 4%', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h1>Collector Catalog</h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: 140 }}>
                <option value="ALL">All Categories</option>
                <option value="Figure">Figures</option>
                <option value="Model">Models</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {filteredCatalog.map((item) => (
              <div key={item.name} style={{ background: '#fff', border: '1px solid #eeedf3', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{item.icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#ede8ff', color: '#5234c3' }}>
                  {item.type}
                </span>
                <h3 style={{ margin: '10px 0 6px' }}>{item.name}</h3>
                <p style={{ color: '#69697c', fontSize: '0.88rem', marginBottom: 16 }}>{item.desc}</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleAddItem(item.name, item.type, item.desc)}
                >
                  + Add to Shelf
                </button>
              </div>
            ))}
          </div>
        </main>

        <aside style={{ background: '#fff', border: '1px solid #eeedf3', borderRadius: 16, padding: 24 }}>
          <h2>Your Saved Shelf</h2>
          <p style={{ color: '#69697c', fontSize: '0.85rem' }}>Interactive record storage for your account</p>
          {feedback && <p style={{ fontSize: '0.85rem', color: '#027a48', fontWeight: 600 }}>{feedback}</p>}

          <form onSubmit={(e) => { e.preventDefault(); handleAddItem(customName, customType); setCustomName(''); }} style={{ margin: '16px 0', display: 'grid', gap: 8 }}>
            <input
              type="text"
              placeholder="Custom item name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
            />
            <select value={customType} onChange={(e) => setCustomType(e.target.value)}>
              <option value="Figure">Action Figure</option>
              <option value="Model">Model Kit</option>
            </select>
            <button type="submit" style={{ padding: 8, background: '#24243a', color: '#fff', border: 0, borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
              Add Custom
            </button>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e6e2f5', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>Item</th>
                <th style={{ padding: '8px 4px' }}>Type</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shelf.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#69697c' }}>Shelf empty.</td></tr>
              ) : (
                shelf.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f0edf8' }}>
                    <td style={{ padding: '8px 4px' }}><strong>{item.name}</strong></td>
                    <td style={{ padding: '8px 4px' }}>{item.type}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        style={{ border: 0, background: 'none', color: '#b42318', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </aside>
      </div>
    </div>
  );
};
