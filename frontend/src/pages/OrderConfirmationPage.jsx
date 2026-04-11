import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMyOrder } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./CustomerFlow.css";

const ORDER_FLOW = ["CONFIRMED", "PREPARING", "READY", "COMPLETED"];
const STATUS_LABELS = {
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed"
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(state?.order || null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) return;
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }
    const load = async () => {
      try {
        const data = await getMyOrder(orderId, token);
        setOrder(data || null);
      } catch (err) {
        setError(err?.message || "Failed to load order.");
      }
    };
    load();
  }, [order, orderId, token]);

  const statusSteps = useMemo(() => {
    const current = order?.status || "CONFIRMED";
    const currentIndex = ORDER_FLOW.indexOf(current);
    return ORDER_FLOW.map((step, index) => ({
      id: step,
      label: STATUS_LABELS[step],
      done: currentIndex >= index,
      current: current === step
    }));
  }, [order]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (order?.cafeOwnerId) {
      navigate(`/cafes/${order.cafeOwnerId}/menu`);
      return;
    }
    navigate("/cafes");
  };

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Order Confirmation</h2>
              <p>Your order is placed successfully.</p>
            </div>
            <button className="customer-btn ghost" onClick={handleGoBack}>
              Back
            </button>
          </div>

          {error && <div className="customer-state">{error}</div>}
          {!order ? (
            <div className="customer-state">Loading order details...</div>
          ) : (
            <div className="order-confirm-grid">
              <div className="detail-list">
                <div className="detail-item">
                  <span>Order ID</span>
                  <strong>#{order.id}</strong>
                </div>
                <div className="detail-item">
                  <span>Customer</span>
                  <strong>{order.customerName || "--"}</strong>
                </div>
                <div className="detail-item">
                  <span>Phone</span>
                  <strong>{order.customerPhone || "--"}</strong>
                </div>
                <div className="detail-item">
                  <span>Cafe</span>
                  <strong>{order.cafeName}</strong>
                </div>
                <div className="detail-item">
                  <span>Payment</span>
                  <strong>{formatPayment(order.paymentMethod)}</strong>
                  {order.paymentReceipt && <small className="detail-item-helper">Receipt {order.paymentReceipt}</small>}
                </div>
                <div className="detail-item">
                  <span>Serving Table</span>
                  <strong>{order.tableNumber || "--"}</strong>
                </div>
                {order.deliveryNotes && (
                  <div className="detail-item">
                    <span>Special Instructions</span>
                    <strong>{order.deliveryNotes}</strong>
                  </div>
                )}
                <div className="detail-item">
                  <span>Total Amount</span>
                  <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div className="order-confirm-summary">
                <div className="order-status-header">
                  <span>Current Status</span>
                  <strong>{formatStatus(order.status)}</strong>
                </div>
                <div className="order-status-steps">
                  {statusSteps.map((step) => (
                    <span
                      key={step.id}
                      className={`order-status-chip ${step.id.toLowerCase()} ${step.done ? "done" : "pending"} ${step.current ? "current" : ""}`}
                    >
                      {step.label}
                    </span>
                  ))}
                </div>
                <div className="order-confirm-actions">
                  <button className="customer-btn ghost order-confirm-secondary" onClick={handleGoBack}>
                    Previous Page
                  </button>
                  <button className="customer-btn ghost order-confirm-secondary" onClick={() => navigate(`/orders/${order.id}/receipt`)}>
                    View Receipt
                  </button>
                  <button className="customer-btn ghost order-confirm-secondary" onClick={() => navigate("/orders")}>
                    Previous Orders
                  </button>
                  <button className="customer-btn light order-confirm-cta" onClick={() => navigate("/cafes")}>
                    Continue Browsing Cafes
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatPayment(value) {
  if (value === "PAY_AT_CAFE") return "Pay at Cafe";
  return "Online";
}

function formatStatus(value) {
  if (!value) return STATUS_LABELS.CONFIRMED;
  return STATUS_LABELS[value] || value.replaceAll("_", " ");
}
