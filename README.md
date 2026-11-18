# Secret Shop (MERN-G38)

An action figure marketplace: React frontend + Express/MongoDB backend.

```
backend/    Express API (server.js) — talks to MongoDB Atlas, database FigurinesDB
frontend/   React + Vite app — calls the API in backend/
```

## Run it locally

You need two terminals.

**1. Backend** (http://localhost:5000)

```bash
cd backend
cp .env.example .env      # then put the real MONGO_URI in .env
npm install
npm run dev
```

**2. Frontend** (http://localhost:8000)

```bash
cd frontend
npm install
npm run dev
```

## How the two connect

The frontend builds every API address with `src/utils/buildPath.ts`, using
`VITE_API_BASE_URL`:

| File | Value | Meaning |
|---|---|---|
| `frontend/.env.development` | `http://localhost:5000` | `npm run dev` calls the local backend |
| `frontend/.env.production` | *(empty)* | the built site calls `/api/...` on its own server |

The shapes the backend sends are described in `frontend/src/types/shop.ts`.

### API used by the frontend

| Method | Route | Body / query | Returns |
|---|---|---|---|
| POST | `/api/register` | `{ firstName, lastName, email, username, password }` | `{ id, username, ... }` |
| POST | `/api/login` | `{ username, password }` | `{ id, username, firstName, lastName, email }` |
| GET | `/api/figures` | `?search=&category=All` | `Figure[]` |
| POST | `/api/figures` | multipart form: `name, manufacturer, price, category, stock, userId, image` (.png) | the new `Figure` |
| GET | `/api/cart/:userId` | | `CartItem[]` (`{ figure, quantity }`) |
| POST | `/api/cart/add` | `{ userId, figureId }` | updated `CartItem[]` |
| POST | `/api/cart/remove` | `{ userId, figureId }` | updated `CartItem[]` |
| POST | `/api/cart/checkout` | `{ userId }` | `{ message }` |
| POST | `/api/addfig` | JSON `{ name, description, category, image, manufacturer, price }` | `{ id, message }` |

Figure pictures are served from `backend/uploads` at `/uploads/<file>`. A record
whose `image` is just a file name (like `goku.png`) is shown from
`/uploads/goku.png`, so put that file in `backend/uploads/`.
