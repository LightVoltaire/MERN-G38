// The shapes the backend sends (see backend/server.js)

// GET /api/figures. The backend fills in imageUrl and stock for older records.
export interface Figure {
  _id: string;
  name: string;
  manufacturer: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  description?: string;
}

// GET /api/cart/:userId returns a list of these
export interface CartItem {
  figure: Figure;
  quantity: number;
}

// What we keep in localStorage after login (see utils/session.ts)
export interface UserSession {
  userId: string;
  username: string;
}
