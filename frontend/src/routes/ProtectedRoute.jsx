// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isAuthorized } from "../utils/roles.js";
import SEO from "../components/common/SEO.jsx";

export default function ProtectedRoute({ children, allowedRoles = [], redirectTo = "/dashboard" }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontSize: "1.05rem" }}>
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontSize: "1.05rem" }}>
        Restoring session...
      </div>
    );
  }

  if (!isAuthorized(user, allowedRoles)) {
    const target = redirectTo === location.pathname ? "/login" : redirectTo;
    return <Navigate to={target} replace state={target === "/login" ? { from: location } : undefined} />;
  }

  return (
    <>
      <SEO noindex={true} />
      {children}
    </>
  );
}
