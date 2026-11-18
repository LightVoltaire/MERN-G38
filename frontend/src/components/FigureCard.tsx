import type { Figure } from '../types/shop';
import { buildPath } from '../utils/buildPath';

interface FigureCardProps {
  figure: Figure;
  onAddToCart: (figureId: string) => void;
}

export default function FigureCard({ figure, onAddToCart }: FigureCardProps) {
  const isAvailable = figure.stock > 0;

  return (
    <div
      className={`card h-100 shadow-sm ${!isAvailable ? 'bg-light text-muted border-secondary' : ''}`}
      style={{
        opacity: isAvailable ? 1 : 0.55,
        filter: isAvailable ? 'none' : 'grayscale(85%)',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div className="p-3 text-center bg-white border-bottom" style={{ height: '220px' }}>
        <img
          src={buildPath(figure.imageUrl)}
          alt={figure.name}
          className="h-100 w-auto object-fit-contain"
          style={{ maxWidth: '100%' }}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-secondary">{figure.category}</span>
          <span className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'}`}>
            {isAvailable ? `Available (${figure.stock} left)` : 'Out of Stock'}
          </span>
        </div>

        <h5 className="card-title mb-1">{figure.name}</h5>
        <p className="card-text text-muted small mb-2">
          Manufacturer: <strong>{figure.manufacturer}</strong>
        </p>

        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          <span className="fs-5 fw-bold">${figure.price.toFixed(2)}</span>
          <button
            className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!isAvailable}
            onClick={() => onAddToCart(figure._id)}
          >
            {isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}