import { motion } from "framer-motion";
import { Coffee, LayoutDashboard, LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCartCount } from "../../utils/cart";
import "./Navbar.css";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === "CAFE_OWNER";
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "CHEF" || user?.role === "WAITER";
  const isCustomer = Boolean(token) && !isOwner && !isAdmin && !isStaff;
  const [cartCount, setCartCount] = useState(getCartCount());

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", syncCart);
    return () => window.removeEventListener("cart-updated", syncCart);
  }, []);

  const dashboardPath = isAdmin
    ? "/admin"
    : isOwner
      ? "/owner"
      : isStaff
        ? "/staff"
        : "/dashboard";

  const dashboardLabel = isAdmin ? "Admin" : isOwner ? "Owner" : isStaff ? "Staff" : "Dashboard";

  return (
    <header className="cc-nav-wrap">
      <nav className="cc-nav">
        <Link to="/" className="cc-brand">
          <span className="cc-brand-mark"><Coffee size={16} /></span>
          <span className="cc-brand-text">CoffeeConnect</span>
        </Link>

        <div className="cc-nav-links">
          <NavLink to="/" className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>Home</NavLink>

          {!token ? (
            <>
              <NavLink to="/login" className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>Login</NavLink>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <NavLink to="/signup" className="cc-cta">Sign Up</NavLink>
              </motion.div>
            </>
          ) : (
            <>
              <NavLink to={dashboardPath} className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>
                <LayoutDashboard size={15} />
                {dashboardLabel}
              </NavLink>
              {isCustomer && (
                <>
                  <NavLink to="/cafes" className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>Cafes</NavLink>
                  <NavLink to="/booking" className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>Book Table</NavLink>
                  <NavLink to="/cart" className={({ isActive }) => `cc-link ${isActive ? "active" : ""}`}>
                    <ShoppingCart size={15} />
                    Cart ({cartCount})
                  </NavLink>
                </>
              )}
              <span className="cc-user-pill"><UserRound size={14} /> {user?.email || "Account"}</span>
              <button
                type="button"
                className="cc-logout"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
