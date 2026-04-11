import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  ChartColumnBig,
  ChefHat,
  LayoutDashboard,
  NotebookTabs,
  Settings,
  Store,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import PremiumButton from "../../components/ui/PremiumButton";
import { getCafeOwnerMe } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./OwnerDashboard.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/owner", icon: LayoutDashboard, end: true },
  { label: "Cafe Profile", path: "/owner/profile", icon: Store },
  { label: "Menu", path: "/owner/menu", icon: NotebookTabs },
  { label: "Staff", path: "/owner/staff", icon: ChefHat },
  { label: "Bookings", path: "/owner/bookings", icon: Users },
  { label: "Compliance", path: "/owner/compliance", icon: BadgeCheck },
  { label: "Analytics", path: "/owner/analytics", icon: ChartColumnBig },
  { label: "Settings", path: "/owner/settings", icon: Settings }
];

export default function OwnerLayout() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOwner = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCafeOwnerMe(token);
      setOwner(data);
    } catch (err) {
      setOwner(null);
      setError(err?.message || "Failed to load cafe profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwner();
  }, [token]);

  if (loading) {
    return (
      <div className="owner-loading owner-shell-fallback">
        <div className="owner-loader-text">Loading owner console...</div>
      </div>
    );
  }

  if (error && !owner) {
    return (
      <div className="owner-empty owner-shell-fallback">
        <div>
          <h2>Cafe profile not found</h2>
          <p>Create your cafe profile to unlock the dashboard.</p>
          <PremiumButton type="button" onClick={() => navigate("/signup?role=owner")}>
            Register Cafe
          </PremiumButton>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-shell owner-premium-bg">
      <aside className="owner-sidebar">
        <div className="owner-brand">
          <div className="owner-brand-mark"><Activity size={16} /></div>
          <div>
            <strong>Cafe Console</strong>
            <small>Control Center</small>
          </div>
        </div>

        <nav className="owner-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `owner-link ${isActive ? "active" : ""}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span className="active-highlight" layoutId="owner-nav-active" />}
                    <span className="owner-link-inner">
                      <Icon size={16} />
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <PremiumButton
          type="button"
          variant="ghost"
          className="owner-logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sign Out
        </PremiumButton>
      </aside>

      <main className="owner-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet context={{ owner, reloadOwner: loadOwner, token }} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
