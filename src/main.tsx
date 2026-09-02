import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/doto/full.css";
import App from "./App";
import "../tokens.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
