import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import ProfessorRoute from "./components/ProfessorRoute";

import Aulas from "./pages/Aulas";
import Dashboard from "./pages/Dashboard";
import Doacoes from "./pages/Doacoes";
import Login from "./pages/Login";
import Noticias from "./pages/Noticias";
import Relatorio from "./pages/Relatorio";
import Voluntarios from "./pages/Voluntarios";

function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas privadas (envoltas no Layout com Navbar) */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/aulas" element={<Aulas />} />
        <Route path="/noticias" element={<Noticias />} />

        {/* Rotas só de professor */}
        <Route
          path="/doacoes"
          element={
            <ProfessorRoute>
              <Doacoes />
            </ProfessorRoute>
          }
        />
        <Route
          path="/voluntarios"
          element={
            <ProfessorRoute>
              <Voluntarios />
            </ProfessorRoute>
          }
        />
        <Route
          path="/relatorio"
          element={
            <ProfessorRoute>
              <Relatorio />
            </ProfessorRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
