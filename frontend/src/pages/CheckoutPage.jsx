import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDummyPaymentOrder,
  createOrder,
  createRazorpayOrder,
  createRazorpayQrCode,
  getRazorpayQrPaymentStatus
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import { clearCart, getCart, updateCartTableNumber } from "../utils/cart";
import "./CustomerFlow.css";

const TAX_RATE = 0.05;
const PAYMENT_MODE = (import.meta.env.VITE_PAYMENT_MODE || "RAZORPAY").toUpperCase();
const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const QR_POLL_INTERVAL_MS = 3000;
let razorpayScriptPromise = null;

function ensureRazorpayLoaded() {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

function openRazorpayCheckout(paymentOrder, userEmail) {
  return new Promise((resolve, reject) => {
    const options = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: paymentOrder.cafeName || "CoffeeConnect",
      description: "Cafe order payment",
      order_id: paymentOrder.orderId,
      prefill: {
        email: userEmail || ""
      },
      notes: {
        receipt: paymentOrder.receipt || ""
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user"))
      },
      theme: {
        color: "#4B2E2B"
      }
    };
    const gateway = new window.Razorpay(options);
    gateway.open();
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [cart] = useState(getCart());
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [onlineMode, setOnlineMode] = useState("CHECKOUT");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [tableNumber, setTableNumber] = useState(cart?.tableNumber || "");
  const [qrSession, setQrSession] = useState(null);
  const [qrStatusMessage, setQrStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const qrFinalizeLock = useRef(false);
  const latestDraftRef = useRef(null);

  const totals = useMemo(() => {
    const subtotal = (cart?.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  latestDraftRef.current = {
    cart,
    customerName,
    customerPhone,
    deliveryNotes,
    paymentMethod,
    tableNumber,
    token
  };

  useEffect(() => {
    if (paymentMethod !== "ONLINE" || onlineMode !== "QR") {
      setQrSession(null);
      setQrStatusMessage("");
      qrFinalizeLock.current = false;
    }
  }, [onlineMode, paymentMethod]);

  useEffect(() => {
    if (paymentMethod !== "ONLINE" || onlineMode !== "QR" || !qrSession?.qrCodeId) {
      return undefined;
    }

    let active = true;

    const pollStatus = async () => {
      try {
        const status = await getRazorpayQrPaymentStatus(qrSession.qrCodeId, token);
        if (!active) return;

        setQrSession((current) => (current ? {
          ...current,
          ...status,
          receipt: current.receipt || status.receipt
        } : current));

        if (status.paymentCaptured && !qrFinalizeLock.current) {
          qrFinalizeLock.current = true;
          setQrStatusMessage("Payment received. Finalizing your order...");
          setSubmitting(true);
          try {
            await finalizeQrOrder({
              qrCodeId: qrSession.qrCodeId,
              paymentId: status.paymentId,
              receipt: qrSession.receipt || status.receipt
            });
          } catch (err) {
            qrFinalizeLock.current = false;
            setSubmitting(false);
            setError(err?.message || "Failed to place order.");
          }
          return;
        }

        if (status.status === "closed") {
          setQrStatusMessage(status.closeReason
            ? `QR closed: ${formatQrText(status.closeReason)}.`
            : "QR code closed before payment was captured.");
        } else if (!status.paymentCaptured) {
          setQrStatusMessage("Scan the QR with any UPI app. We will confirm payment automatically.");
        }
      } catch (err) {
        if (!active) return;
        setQrStatusMessage(err?.message || "Unable to refresh QR payment status.");
      }
    };

    pollStatus();
    const intervalId = window.setInterval(pollStatus, QR_POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [onlineMode, paymentMethod, qrSession?.qrCodeId, qrSession?.receipt, token]);

  if (!cart?.items?.length) {
    return (
      <div className="customer-page">
        <div className="customer-shell">
          <div className="customer-state">Your cart is empty. Add items before checkout.</div>
        </div>
      </div>
    );
  }

  const validateCheckout = () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return false;
    }
    if (!/^[0-9]{10}$/.test(customerPhone.trim())) {
      setError("Phone number must be 10 digits.");
      return false;
    }
    if (!tableNumber.trim()) {
      setError("Table number is required for dine-in orders.");
      return false;
    }
    return true;
  };

  const buildOrderPayload = (paymentExtras = {}) => {
    const normalizedTableNumber = tableNumber.trim();
    updateCartTableNumber(normalizedTableNumber, cart.cafeId);
    return {
      cafeOwnerId: cart.cafeId,
      paymentMethod,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryNotes: deliveryNotes.trim() || null,
      tableNumber: normalizedTableNumber,
      items: cart.items.map((item) => ({
        menuItemId: item.itemId,
        quantity: item.quantity
      })),
      ...paymentExtras
    };
  };

  const completeOrder = (response) => {
    clearCart();
    navigate(`/orders/${response.id}/confirmation`, { state: { order: response } });
  };

  const finalizeQrOrder = async ({ qrCodeId, paymentId, receipt }) => {
    const draft = latestDraftRef.current;
    if (!draft?.cart?.items?.length) {
      throw new Error("Cart is empty.");
    }
    const response = await createOrder(
      buildOrderPayload({
        razorpayQrCodeId: qrCodeId,
        razorpayPaymentId: paymentId || null,
        razorpayReceipt: receipt || null
      }),
      draft.token
    );
    completeOrder(response);
  };

  const generateQrCode = async () => {
    if (!token) {
      throw new Error("Your session expired. Please sign in again.");
    }
    const qr = await createRazorpayQrCode(
      {
        cafeOwnerId: cart.cafeId,
        items: cart.items.map((item) => ({
          menuItemId: item.itemId,
          quantity: item.quantity
        }))
      },
      token
    );
    setQrSession(qr);
    setQrStatusMessage("QR ready. Scan it with any UPI app to complete payment.");
  };

  const handleConfirmOrder = async () => {
    if (!validateCheckout()) {
      return;
    }
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }
    if (user?.role && user.role !== "USER") {
      setError("Please sign in with a customer account to place and pay for orders.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = buildOrderPayload();

      if (paymentMethod === "ONLINE") {
        if (PAYMENT_MODE === "DUMMY") {
          const paymentResult = await createDummyPaymentOrder(
            { cafeOwnerId: payload.cafeOwnerId, items: payload.items },
            token
          );
          const response = await createOrder(
            {
              ...payload,
              razorpayOrderId: paymentResult.orderId,
              razorpayPaymentId: paymentResult.paymentId,
              razorpaySignature: paymentResult.signature,
              razorpayReceipt: paymentResult.receipt
            },
            token
          );
          completeOrder(response);
          return;
        }

        if (onlineMode === "QR") {
          if (!qrSession?.qrCodeId) {
            await generateQrCode();
            return;
          }

          const status = await getRazorpayQrPaymentStatus(qrSession.qrCodeId, token);
          setQrSession((current) => (current ? { ...current, ...status } : current));
          if (!status.paymentCaptured) {
            setQrStatusMessage("Payment not captured yet. Scan the QR and try again, or wait for auto-detection.");
            return;
          }
          qrFinalizeLock.current = true;
          await finalizeQrOrder({
            qrCodeId: qrSession.qrCodeId,
            paymentId: status.paymentId,
            receipt: qrSession.receipt || status.receipt
          });
          return;
        }

        await ensureRazorpayLoaded();
        const paymentOrder = await createRazorpayOrder(
          { cafeOwnerId: payload.cafeOwnerId, items: payload.items },
          token
        );
        const paymentResult = await openRazorpayCheckout(paymentOrder, user?.email);
        const response = await createOrder(
          {
            ...payload,
            razorpayOrderId: paymentResult.razorpay_order_id,
            razorpayPaymentId: paymentResult.razorpay_payment_id,
            razorpaySignature: paymentResult.razorpay_signature,
            razorpayReceipt: paymentOrder.receipt
          },
          token
        );
        completeOrder(response);
        return;
      }

      const response = await createOrder(payload, token);
      completeOrder(response);
    } catch (err) {
      qrFinalizeLock.current = false;
      setError(err?.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Checkout</h2>
              <p>Review your dine-in order, confirm your table, and complete payment.</p>
            </div>
            <button className="customer-btn ghost" onClick={() => navigate("/cart")}>Back to Cart</button>
          </div>

          {error && <div className="customer-state">{error}</div>}

          <div className="checkout-layout">
            <div className="checkout-form-stack">
              <section className="checkout-section">
                <div className="checkout-section-head">
                  <h3>Contact Details</h3>
                  <p>Use these details for confirmation and support.</p>
                </div>
                <div className="checkout-input-grid">
                  <label className="checkout-field">
                    <span>Full Name</span>
                    <input
                      className="customer-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Phone Number</span>
                    <input
                      className="customer-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10 digit mobile number"
                    />
                  </label>
                  <label className="checkout-field checkout-field-full">
                    <span>Email</span>
                    <input
                      className="customer-input"
                      value={user?.email || ""}
                      readOnly
                      placeholder="Logged in email"
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-head">
                  <h3>Dine-In Details</h3>
                  <p>Table number tells the chef and waiter where to serve this order.</p>
                </div>
                <div className="checkout-input-grid">
                  <label className="checkout-field">
                    <span>Table Number</span>
                    <input
                      className="customer-input"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        updateCartTableNumber(e.target.value, cart.cafeId);
                      }}
                      placeholder="e.g. T12"
                    />
                  </label>
                  <label className="checkout-field checkout-field-full">
                    <span>Special Instructions</span>
                    <textarea
                      className="customer-input customer-textarea"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Less sugar, extra hot, no onion, etc."
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-head">
                  <h3>Order Details</h3>
                  <p>Review items before payment.</p>
                </div>
                <div className="checkout-order-list">
                  <div className="checkout-order-row checkout-order-row-head">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Amount</span>
                  </div>
                  {cart.items.map((item) => (
                    <div key={item.itemId} className="checkout-order-row">
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.description || "Freshly prepared"}</small>
                      </div>
                      <span>{item.quantity}</span>
                      <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-head">
                  <h3>Payment</h3>
                  <p>Select how you want to complete this order.</p>
                </div>
                <div className="checkout-input-grid">
                  <label className="checkout-field checkout-field-full">
                    <span>Payment Method</span>
                    <select className="customer-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="ONLINE">Online</option>
                      <option value="PAY_AT_CAFE">Pay at Cafe</option>
                    </select>
                  </label>
                  {paymentMethod === "ONLINE" && PAYMENT_MODE !== "DUMMY" && (
                    <label className="checkout-field checkout-field-full">
                      <span>Online Payment Mode</span>
                      <select className="customer-select" value={onlineMode} onChange={(e) => setOnlineMode(e.target.value)}>
                        <option value="CHECKOUT">Razorpay Checkout</option>
                        <option value="QR">Razorpay QR</option>
                      </select>
                    </label>
                  )}
                  {paymentMethod === "ONLINE" && PAYMENT_MODE === "DUMMY" && (
                    <small className="checkout-note">Test mode: dummy payment will auto-complete.</small>
                  )}
                  {paymentMethod === "ONLINE" && onlineMode === "QR" && PAYMENT_MODE !== "DUMMY" && (
                    <div className="checkout-field checkout-field-full qr-payment-panel">
                      <span>Razorpay QR</span>
                      {!qrSession ? (
                        <div className="qr-payment-copy">
                          <strong>Generate a fixed-amount QR for this order.</strong>
                          <small>We will watch the payment status and create the order as soon as the QR payment is captured.</small>
                        </div>
                      ) : (
                        <div className="qr-payment-shell">
                          <div className="qr-payment-copy">
                            <strong>Scan to pay ₹{Number(qrSession.totalAmount || totals.total).toFixed(2)}</strong>
                            <small>{qrStatusMessage || "Scan the QR with any UPI app."}</small>
                            <small>Receipt: {qrSession.receipt || "--"}</small>
                          </div>
                          {qrSession.imageUrl && (
                            <div className="qr-preview-card">
                              <img src={qrSession.imageUrl} alt="Razorpay QR code" className="qr-preview-image" />
                            </div>
                          )}
                          <div className="flow-chips">
                            <span>Status: {formatQrText(qrSession.status)}</span>
                            <span>{qrSession.paymentCaptured ? "Payment Captured" : "Waiting for payment"}</span>
                          </div>
                          <div className="order-history-actions">
                            <button
                              className="customer-btn ghost"
                              type="button"
                              onClick={() => {
                                qrFinalizeLock.current = false;
                                setQrSession(null);
                                setQrStatusMessage("");
                              }}
                              disabled={submitting}
                            >
                              Generate New QR
                            </button>
                            <button
                              className="customer-btn light"
                              type="button"
                              onClick={async () => {
                                try {
                                  const status = await getRazorpayQrPaymentStatus(qrSession.qrCodeId, token);
                                  setQrSession((current) => (current ? { ...current, ...status } : current));
                                  setQrStatusMessage(status.paymentCaptured
                                    ? "Payment received. Finalizing your order..."
                                    : "Payment not captured yet. Try again after scanning.");
                                } catch (err) {
                                  setQrStatusMessage(err?.message || "Unable to refresh QR payment status.");
                                }
                              }}
                              disabled={submitting}
                            >
                              Refresh Payment Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="summary-card checkout-summary-card">
              <div className="checkout-summary-head">
                <h3>Payment Summary</h3>
                <p>{cart.cafeName}</p>
              </div>
              <div className="summary-row">
                <span>Serving Table</span>
                <strong>{tableNumber.trim() || "--"}</strong>
              </div>
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
              <button className="customer-btn" onClick={handleConfirmOrder} disabled={submitting}>
                {submitting
                  ? paymentMethod === "ONLINE" && onlineMode === "QR" && PAYMENT_MODE !== "DUMMY"
                    ? (qrSession ? "Finalizing Order..." : "Generating QR...")
                    : "Placing Order..."
                  : paymentMethod === "ONLINE" && onlineMode === "QR" && PAYMENT_MODE !== "DUMMY"
                    ? (qrSession ? "Check QR Payment" : "Generate Razorpay QR")
                    : "Confirm Order"}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatQrText(value) {
  if (!value) return "Pending";
  return value.replaceAll("_", " ");
}
