// ─── Backend Configuration ─────────────────────────────────────────────────────
// Single source of truth for the server base URL.
// Change the values in client/.env to point at a different environment:
//   VITE_API_URL=https://your-api.example.com/api
//   VITE_UPLOADS_URL=https://your-api.example.com/uploads

export const SERVER_URL = import.meta.env.VITE_API_URL;

export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL;
