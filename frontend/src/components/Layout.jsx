import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted small">
        Projeto Vela Para Todos · FBVA · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
