import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./CustomerFlow.css";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyOrders(token);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const summary = useMemo(() => {
    const paidOnline = orders.filter((order) => order.paymentMethod === "ONLINE").length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    return {
      count: orders.length,
      paidOnline,
      totalSpent
    };
  }, [orders]);

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Previous Orders</h2>
              <p>Revisit dine-in orders, open receipts, and track completed payments.</p>
            </div>
            <div className="flow-chips">
              <button className="customer-btn ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
              <button className="customer-btn light" onClick={() => navigate("/cafes")}>Browse Cafes</button>
            </div>
          </div>

          {error && <div className="customer-state">{error}</div>}

          <div className="customer-grid-two">
            <div className="summary-card">
              <div className="summary-row">
                <span>Total Orders</span>
                <strong>{summary.count}</strong>
              </div>
              <div className="summary-row">
                <span>Online Payments</span>
                <strong>{summary.paidOnline}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Spent</span>
                <strong>₹{summary.totalSpent.toFixed(2)}</strong>
              </div>
            </div>

            <div className="detail-item">
              <span>Receipt Access</span>
              <strong>Every paid order can open a printable receipt.</strong>
              <small className="detail-item-helper">Use the receipt button on any order card below.</small>
            </div>
          </div>

          {loading ? (
            <div className="customer-state">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="customer-state">No previous orders found yet.</div>
          ) : (
            <div className="order-history-grid">
              {orders.map((order) => (
                <article key={order.id} className="order-history-card">
                  <div className="order-history-head">
                    <div>
                      <h3>{order.cafeName}</h3>
                      <p>Order #{order.id} · {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`payment-badge ${order.paymentMethod === "ONLINE" ? "online" : "offline"}`}>
                      {formatPayment(order.paymentMethod)}
                    </span>
                  </div>

                  <div className="order-history-meta">
                    <div>
                      <span>Status</span>
                      <strong>{formatStatus(order.status)}</strong>
                    </div>
                    <div>
                      <span>Table</span>
                      <strong>{order.tableNumber || "--"}</strong>
                    </div>
                    <div>
                      <span>Total</span>
                      <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>Receipt</span>
                      <strong>{order.paymentReceipt || "--"}</strong>
                    </div>
                  </div>

                  <div className="order-history-items">
                    {(order.items || []).slice(0, 4).map((item) => (
                      <span key={`${order.id}-${item.id || item.menuItemId || item.itemName}`}>{item.itemName} x{item.quantity}</span>
                    ))}
                  </div>

                  <div className="order-history-actions">
                    <button className="customer-btn ghost" onClick={() => navigate(`/orders/${order.id}/confirmation`)}>
                      Track Order
                    </button>
                    <button className="customer-btn" onClick={() => navigate(`/orders/${order.id}/receipt`)}>
                      Open Receipt
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatPayment(value) {
  return value === "PAY_AT_CAFE" ? "Pay at Cafe" : "Online";
}

function formatStatus(value) {
  if (!value) return "Confirmed";
  return value.replaceAll("_", " ");
}
