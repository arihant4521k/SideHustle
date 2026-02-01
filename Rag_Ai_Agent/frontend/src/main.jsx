// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import App from "./App";
import "./styles.css"; // Ensure this imports Tailwind directives

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);