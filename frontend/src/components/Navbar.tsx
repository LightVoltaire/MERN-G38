import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  cartCount: number;
}

export default function Navbar({ cartCount }: NavbarProps) {
  const navigate = useNavigate();
  const username = localStorage.getItem('secret_shop_user') || 'Collector';

  const handleLogout = () => {
    localStorage.removeItem('secret_shop_userId');
    localStorage.removeItem('secret_shop_user');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/home">
          Secret Shop
        </Link>
        <div className="d-flex align-items-center gap-3">
          <span className="text-light small d-none d-md-inline">Welcome, {username}</span>
          <Link className="btn btn-outline-light btn-sm" to="/home">
            Catalogue
          </Link>
          <Link className="btn btn-warning btn-sm fw-semibold" to="/cart">
            Cart ({cartCount})
          </Link>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}