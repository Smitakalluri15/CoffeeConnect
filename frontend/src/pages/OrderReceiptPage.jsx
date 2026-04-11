import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyOrder } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./CustomerFlow.css";

export default function OrderReceiptPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Your session expired. Please sign in again.");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyOrder(orderId, token);
        setOrder(data || null);
      } catch (err) {
        setError(err?.message || "Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, token]);

  const totals = useMemo(() => ({
    subtotal: Number(order?.subtotal || 0),
    tax: Number(order?.taxAmount || 0),
    total: Number(order?.totalAmount || 0)
  }), [order]);

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Receipt</h2>
              <p>Printable payment summary for your dine-in order.</p>
            </div>
            <div className="flow-chips">
              <button className="customer-btn ghost" onClick={() => navigate("/orders")}>Previous Orders</button>
              <button className="customer-btn light" onClick={() => navigate(`/orders/${orderId}/confirmation`)}>Track Order</button>
            </div>
          </div>

          {error && <div className="customer-state">{error}</div>}
          {loading ? (
            <div className="customer-state">Loading receipt...</div>
          ) : !order ? (
            <div className="customer-state">Receipt not found.</div>
          ) : (
            <>
              <div className="receipt-actions">
                <button className="customer-btn" onClick={() => window.print()}>Print Receipt</button>
                <button className="customer-btn ghost" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
              </div>

              <article className="receipt-card">
                <header className="receipt-header">
                  <div>
                    <span>Receipt No.</span>
                    <h3>{order.paymentReceipt || `ORDER-${order.id}`}</h3>
                    <p>{order.cafeName}</p>
                  </div>
                  <div className="receipt-status-block">
                    <span className={`payment-badge ${order.paymentMethod === "ONLINE" ? "online" : "offline"}`}>
                      {formatPayment(order.paymentMethod)}
                    </span>
                    <strong>{formatStatus(order.status)}</strong>
                  </div>
                </header>

                <div className="receipt-grid">
                  <div>
                    <span>Customer</span>
                    <strong>{order.customerName || "--"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{order.customerPhone || "--"}</strong>
                  </div>
                  <div>
                    <span>Table</span>
                    <strong>{order.tableNumber || "--"}</strong>
                  </div>
                  <div>
                    <span>Ordered At</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  <div>
                    <span>Paid At</span>
                    <strong>{formatDate(order.paidAt)}</strong>
                  </div>
                  <div>
                    <span>Payment Ref</span>
                    <strong>{order.paymentId || order.paymentOrderId || "--"}</strong>
                  </div>
                </div>

                <div className="receipt-lines">
                  <div className="receipt-line receipt-line-head">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span>Amount</span>
                  </div>
                  {(order.items || []).map((item) => (
                    <div key={`${order.id}-${item.id || item.menuItemId || item.itemName}`} className="receipt-line">
                      <span>{item.itemName}</span>
                      <span>{item.quantity}</span>
                      <span>₹{Number(item.unitPrice || 0).toFixed(2)}</span>
                      <span>₹{Number(item.lineTotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-totals">
                  <div><span>Subtotal</span><strong>₹{totals.subtotal.toFixed(2)}</strong></div>
                  <div><span>Tax</span><strong>₹{totals.tax.toFixed(2)}</strong></div>
                  <div className="grand-total"><span>Total</span><strong>₹{totals.total.toFixed(2)}</strong></div>
                </div>

                {order.deliveryNotes && (
                  <div className="receipt-notes">
                    <span>Special Instructions</span>
                    <strong>{order.deliveryNotes}</strong>
                  </div>
                )}
              </article>
            </>
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
