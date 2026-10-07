import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.user_role !== allowedRole) {
    if (user.user_role === "owner") {
      return <Navigate to="/owner" replace />;
    }

    return <Navigate to="/player" replace />;
  }

  return children;
}

export default ProtectedRoute;
