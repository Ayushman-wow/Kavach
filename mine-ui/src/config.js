
// Configuration for the application

// robustly determine backend URL based on current hostname
// This ensures that when deployed (not localhost), it ALWAYS uses the Render backend
// regardless of environment variables.

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_URL = isLocal
    ? "http://localhost:8000"
    : "https://kavach-backend-clys.onrender.com";
