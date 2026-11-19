import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white border-t py-4 text-center text-slate-500 text-sm">
        Projeto Vela Para Todos · FBVA · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
