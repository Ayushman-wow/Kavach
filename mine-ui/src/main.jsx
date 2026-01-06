import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { MineProvider } from "./context/MineContext";   // << required

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MineProvider>
      <App />
    </MineProvider>
  </StrictMode>
);
