import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/auth.css";
import { resetPassword } from "../api/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(params.get("token") || "");
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Reset token is missing.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
        style={{ maxWidth: "460px" }}
      >
        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{ color: "var(--espresso)", fontSize: "2rem" }}
          >
            Set New Password
          </motion.h1>
          <p className="muted" style={{ marginTop: "8px" }}>
            Choose a strong password to secure your account.
          </p>
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
          {done && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="success-bubble"
            >
              Password reset successful. Redirecting to login...
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <motion.div className="field" whileFocusWithin={{ x: 5 }}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </motion.div>

          <motion.div className="field" whileFocusWithin={{ x: 5 }}>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </motion.div>

          <button
            type="submit"
            className={`primary-btn full ${loading ? "loading-btn" : ""}`}
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="muted">
          Return to <Link to="/login">login</Link>
        </p>
      </motion.div>
    </div>
  );
}
