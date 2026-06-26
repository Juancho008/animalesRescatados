import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AdminPanel from "./admin/AdminPanel.jsx";
import "./styles/index.css";

const isAdmin = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(document.getElementById("root")).render(
  <StrictMode>{isAdmin ? <AdminPanel /> : <App />}</StrictMode>
);
