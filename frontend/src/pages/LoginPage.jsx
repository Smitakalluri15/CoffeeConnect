import { useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "./LoginPremium.css";

const ROLE = {
  USER: "USER",
  CAFE_OWNER: "CAFE_OWNER"
};

export default function LoginPage({ defaultRole }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = useMemo(() => {
    const param = (searchParams.get("role") || "").toLowerCase();
    if (param === "owner" || param === "cafe_owner" || param === "cafe-owner") {
      return ROLE.CAFE_OWNER;
    }
    return defaultRole || ROLE.USER;
  }, [searchParams, defaultRole]);

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      if (user?.role === "ADMIN") {
        navigate("/admin");
      } else if (user?.role === "CAFE_OWNER") {
        navigate("/owner");
      } else if (user?.role === "CHEF" || user?.role === "WAITER") {
        navigate("/staff");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const subtitle = role === ROLE.CAFE_OWNER
    ? "Access your cafe controls, listings, and orders."
    : "Track orders, bookings, and your coffee rewards.";

  return (
    <div className="auth-bg premium-login">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card login-card"
      >
        <header className="login-header">
          <div>
            <h1>Welcome Back</h1>
            <p>{subtitle}</p>
          </div>
          <div className="role-toggle" role="tablist" aria-label="Login role">
            <div className={`role-indicator ${role === ROLE.CAFE_OWNER ? "right" : "left"}`} />
            <button
              type="button"
              className={`role-btn ${role === ROLE.USER ? "active" : ""}`}
              role="tab"
              aria-selected={role === ROLE.USER}
              onClick={() => setRole(ROLE.USER)}
            >
              User
            </button>
            <button
              type="button"
              className={`role-btn ${role === ROLE.CAFE_OWNER ? "active" : ""}`}
              role="tab"
              aria-selected={role === ROLE.CAFE_OWNER}
              onClick={() => setRole(ROLE.CAFE_OWNER)}
            >
              Cafe Owner
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="error-bubble"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="login-form">
          <motion.div className="field" whileFocusWithin={{ x: 5 }}>
            <label>Email or Username</label>
            <input
              type="text"
              placeholder="espresso@connect.com or chef01"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <motion.div className="field" whileFocusWithin={{ x: 5 }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </motion.div>

          <div className="auth-helper-row">
            <Link to="/forgot-password" className="muted-link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`primary-btn full ${loading ? "loading-btn" : ""}`}
            disabled={loading}
          >
            {loading ? "Brewing your session..." : "Sign In"}
          </button>
        </form>

        <p className="muted">
          New here? <Link to={role === ROLE.CAFE_OWNER ? "/signup?role=owner" : "/signup"}>Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
