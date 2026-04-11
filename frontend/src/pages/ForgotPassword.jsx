import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/auth.css";
import { requestPasswordReset } from "../api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
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
            Reset Password
          </motion.h1>
          <p className="muted" style={{ marginTop: "8px" }}>
            Enter your email to receive a reset link.
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
          {sent && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="success-bubble"
            >
              Reset email sent. Check your inbox.
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <motion.div className="field" whileFocusWithin={{ x: 5 }}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="espresso@connect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </motion.div>

          <button
            type="submit"
            className={`primary-btn full ${loading ? "loading-btn" : ""}`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="muted">
          Remembered your password? <Link to="/login">Go back</Link>
        </p>
      </motion.div>
    </div>
  );
}
