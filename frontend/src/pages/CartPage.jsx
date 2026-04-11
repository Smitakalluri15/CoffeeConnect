import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearCart, getCart, removeCartItem, updateCartItemQuantity } from "../utils/cart";
import "./CustomerFlow.css";

const TAX_RATE = 0.05;

export default function CartPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    const sync = () => setCart(getCart());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const totals = useMemo(() => {
    const subtotal = (cart?.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const handleCheckout = () => {
    if (!cart?.items?.length) return;
    if (!token) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Cart</h2>
              <p>
                {cart?.cafeName
                  ? `${cart.cafeName}${cart.tableNumber ? ` • Serving table ${cart.tableNumber}` : ""}`
                  : "No items selected yet."}
              </p>
            </div>
            <div className="flow-chips">
              <button className="customer-btn ghost" onClick={() => navigate("/cafes")}>Browse Cafes</button>
              <button className="customer-btn light" onClick={() => clearCart()} disabled={!cart?.items?.length}>
                Clear Cart
              </button>
            </div>
          </div>

          {!cart?.items?.length ? (
            <div className="customer-state">Your cart is empty. Add menu items to continue.</div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-list">
                {cart.items.map((item) => (
                  <div key={item.itemId} className="cart-row">
                    <div className="cart-item-copy">
                      <strong>{item.name}</strong>
                      <p style={{ margin: "4px 0 0", color: "#735c4b" }}>{item.description || "Freshly prepared"}</p>
                    </div>
                    <div className="qty-group">
                      <button
                        className="qty-btn"
                        onClick={() => updateCartItemQuantity(item.itemId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateCartItemQuantity(item.itemId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong className="cart-item-price">₹{(item.price * item.quantity).toFixed(0)}</strong>
                    <button className="customer-btn ghost cart-remove-btn" onClick={() => removeCartItem(item.itemId)}>Remove</button>
                  </div>
                ))}
              </div>

              <aside className="summary-card cart-summary-card">
                {cart?.tableNumber && (
                  <div className="summary-row">
                    <span>Serving Table</span>
                    <strong>{cart.tableNumber}</strong>
                  </div>
                )}
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Tax (5%)</span>
                  <strong>₹{totals.tax.toFixed(2)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>₹{totals.total.toFixed(2)}</strong>
                </div>
                <button className="customer-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </aside>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
