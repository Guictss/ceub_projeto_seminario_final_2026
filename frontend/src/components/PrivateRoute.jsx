import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box className="min-h-[60vh] flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
