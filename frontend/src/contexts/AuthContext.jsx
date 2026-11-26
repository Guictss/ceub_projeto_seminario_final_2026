/**
 * AuthContext — gerenciamento global do usuário autenticado.
 *
 * Fornece:
 *   - usuario:  { id, nome, email, papel } ou null
 *   - login(email, senha):  POST /auth/login, salva tokens
 *   - logout():  limpa tokens e estado
 */
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

function hidratarUsuarioInicial() {
  try {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("usuario");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(hidratarUsuarioInicial);

  async function login(email, senha) {
    const { data } = await api.post("/auth/login", { email, senha });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}