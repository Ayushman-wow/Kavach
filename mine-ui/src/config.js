
// Configuration for the application
// Uses Vite's import.meta.env to access environment variables
// Falls back to localhost if not set (for local development without .env)

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
