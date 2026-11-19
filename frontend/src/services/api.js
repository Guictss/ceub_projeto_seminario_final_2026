/**
 * Cliente HTTP centralizado para comunicação com a API Flask.
 *
 * Responsabilidades:
 *   - Prefixar automaticamente todas as requisições com a baseURL
 *   - Anexar o access_token (Authorization: Bearer ...) em cada request
 *   - Tentar renovar o token com refresh_token em caso de 401
 *   - Redirecionar para /login se o refresh também falhar
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ── Instância principal ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: anexa o token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: refresh automático em 401 ──────────────────────
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Só tenta refresh se: foi 401, não é um retry, e não é o próprio refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      // Evita múltiplas requisições de refresh em paralelo
      if (!refreshPromise) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          logoutAndRedirect();
          return Promise.reject(error);
        }

        refreshPromise = axios
          .post(
            `${API_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          )
          .then((res) => {
            localStorage.setItem("access_token", res.data.access_token);
            return res.data.access_token;
          })
          .catch((err) => {
            logoutAndRedirect();
            throw err;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("usuario");
  // Hard redirect — React Router não tem acesso de fora de componente
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default api;
