import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import ProfessorRoute from "./components/ProfessorRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Aulas from "./pages/Aulas";
import Noticias from "./pages/Noticias";
import Doacoes from "./pages/Doacoes";
import Voluntarios from "./pages/Voluntarios";
import Relatorio from "./pages/Relatorio";

function App() {
  return (
    <Routes>
      {/* Rotas publicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas privadas (envolvidas em Layout com Navbar) */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/aulas" element={<Aulas />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route
          path="/doacoes"
          element={<ProfessorRoute><Doacoes /></ProfessorRoute>}
        />
        <Route
          path="/voluntarios"
          element={<ProfessorRoute><Voluntarios /></ProfessorRoute>}
        />
        <Route
          path="/relatorio"
          element={<ProfessorRoute><Relatorio /></ProfessorRoute>}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
