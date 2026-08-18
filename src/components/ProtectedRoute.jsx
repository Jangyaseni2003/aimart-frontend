import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireSeller = false }) {
  const { isAuthenticated, isSeller, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireSeller && !isSeller) return <Navigate to="/" replace />;

  return children;
}
