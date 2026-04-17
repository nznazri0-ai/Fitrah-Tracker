import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FitrahTracker from "./fitrah-tracker";

// ─────────────────────────────────────────────
// Polyfill: window.storage → localStorage
// Diperlukan kerana fitrah-tracker.jsx
// menggunakan API storage Claude Artifacts.
// Polyfill ini memetakannya ke localStorage
// supaya data tetap tersimpan dalam browser.
// ─────────────────────────────────────────────
window.storage = {
  get: async (key) => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? { key, value: val } : null;
    } catch {
      return null;
    }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  delete: async (key) => {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
  list: async (prefix = "") => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(prefix)
      );
      return { keys };
    } catch {
      return { keys: [] };
    }
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FitrahTracker />
  </StrictMode>
);
