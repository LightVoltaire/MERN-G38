export interface Figure {
  _id: string;
  name: string;
  manufacturer: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  figure: Figure;
  quantity: number;
}

// What we keep in localStorage after login (see utils/session.ts)
export interface UserSession {
  userId: string;
  username: string;
}
