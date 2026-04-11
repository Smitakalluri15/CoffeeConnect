import { motion } from "framer-motion";
import {
  BellRing,
  ChefHat,
  Clock3,
  ConciergeBell,
  CreditCard,
  Eye,
  History,
  LogOut,
  RefreshCw,
  Table
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import PremiumModal from "../../components/ui/PremiumModal";
import {
  getStaffDashboard,
  updateStaffBooking,
  updateStaffKitchenStatus,
  updateStaffOrderService
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./StaffDashboard.css";

const CHEF_COLUMNS = ["CONFIRMED", "PREPARING", "READY"];
const DASHBOARD_REFRESH_MS = 5000;
const KITCHEN_LABELS = {
  CONFIRMED: "New Orders",
  PREPARING: "Preparing",
  READY: "Ready for Waiter"
};
const SERVICE_STAGE_LABELS = {
  READY_TO_SERVE: "Ready",
  SERVED: "Served",
  BILLED: "Bill Generated",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  COMPLETED: "Completed"
};
const BOOKING_STATUS_LABELS = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  SEATED: "Seated",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};
const SERVICE_STAGE_ORDER = {
  READY_TO_SERVE: 1,
  SERVED: 2,
  BILLED: 3,
  PAYMENT_PENDING: 4,
  PAID: 5,
  COMPLETED: 6
};
function formatOrderTime(value) {
  if (!value) return "Order time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Order time unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatElapsedMinutes(minutes, delayed = false) {
  if (!Number.isFinite(minutes)) return "Just now";
  const safeMinutes = Math.max(0, Math.round(minutes));
  if (safeMinutes < 1) return "Just now";
  const base = `${safeMinutes} min`;
  return delayed ? `Delayed • ${base}` : `${base} ago`;
}

function serviceStatusKey(stage) {
  switch (stage) {
    case "READY_TO_SERVE":
    case "READY":
      return "ready";
    case "PREPARING":
      return "preparing";
    case "SERVED":
      return "served";
    case "BILLED":
    case "PAYMENT_PENDING":
      return "unassigned";
    case "REJECTED":
      return "rejected";
    default:
      return "served";
  }
}

function compareTableLabels(left, right) {
  const leftValue = String(left || "");
  const rightValue = String(right || "");
  if (leftValue === "Unassigned") return 1;
  if (rightValue === "Unassigned") return -1;
  return leftValue.localeCompare(rightValue, undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function totalOrderQuantity(order) {
  return (order?.lineItems || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
}

function mergeBookingAssignments(previous, bookings) {
  const next = {};
  for (const booking of bookings || []) {
    const serverValue = booking.assignedTable || "";
    const draftValue = previous?.[booking.id];
    next[booking.id] = draftValue && draftValue !== serverValue ? draftValue : serverValue;
  }
  return next;
}

export default function StaffDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingAssignments, setBookingAssignments] = useState({});
  const [pendingAction, setPendingAction] = useState("");
  const [billPreviewOrderId, setBillPreviewOrderId] = useState(null);
  const previousReadyIds = useRef(new Set());
  const [highlightReady, setHighlightReady] = useState(new Set());

  const isChef = user?.role === "CHEF";
  const roleTitle = isChef ? "Chef Dashboard" : "Waiter Dashboard";

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;
    if (!silent) {
      setLoading(true);
    }
    setError("");
    try {
      const data = await getStaffDashboard(token);
      setDashboard(data);
      setBookingAssignments((prev) => mergeBookingAssignments(prev, data?.bookings || []));
    } catch (err) {
      setError(err?.message || "Failed to load staff dashboard");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!token) return undefined;
    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, DASHBOARD_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [loadDashboard, token]);

  const kitchenOrders = dashboard?.kitchenOrders || [];
  const completedKitchenOrders = dashboard?.completedKitchenOrders || [];
  const serviceOrders = dashboard?.serviceOrders || [];
  const completedServiceOrders = dashboard?.completedServiceOrders || [];
  const bookings = dashboard?.bookings || [];
  const tableSummary = dashboard?.tableSummary || {
    totalTables: 0,
    availableTables: 0,
    reservedTables: 0,
    occupiedTables: 0,
    pendingTables: 0
  };

  const groupedChefOrders = useMemo(() => CHEF_COLUMNS.map((status) => ({
    status,
    items: kitchenOrders.filter((order) => order.status === status)
  })), [kitchenOrders]);

  const orderedServiceOrders = useMemo(() => [...serviceOrders].sort((left, right) => {
    const stageRank = (SERVICE_STAGE_ORDER[left.serviceStage] || 99) - (SERVICE_STAGE_ORDER[right.serviceStage] || 99);
    if (stageRank !== 0) return stageRank;
    return new Date(left.createdAt) - new Date(right.createdAt);
  }), [serviceOrders]);

  const readyServiceOrders = useMemo(
    () => orderedServiceOrders.filter((order) => order.serviceStage === "READY_TO_SERVE"),
    [orderedServiceOrders]
  );

  useEffect(() => {
    const currentIds = new Set(readyServiceOrders.map((o) => o.id));
    const newOnes = new Set(
      [...currentIds].filter((id) => !previousReadyIds.current.has(id))
    );
    if (newOnes.size > 0) {
      setHighlightReady(newOnes);
      setTimeout(() => setHighlightReady(new Set()), 3500);
    }
    previousReadyIds.current = currentIds;
  }, [readyServiceOrders]);

  const readyOrdersByTable = useMemo(() => {
    const groups = new Map();
    for (const order of readyServiceOrders) {
      const tableNumber = order.tableNumber || "Unassigned";
      const current = groups.get(tableNumber) || [];
      current.push(order);
      groups.set(tableNumber, current);
    }
    return Array.from(groups.entries())
      .sort(([left], [right]) => compareTableLabels(left, right))
      .map(([tableNumber, orders]) => ({
        tableNumber,
        orders,
        totalQuantity: orders.reduce((total, order) => total + totalOrderQuantity(order), 0)
      }));
  }, [readyServiceOrders]);

  const serviceHistoryOrders = useMemo(() => [...completedServiceOrders].sort((left, right) => {
    const leftTime = new Date(left.servedAt || left.readyAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.servedAt || right.readyAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  }), [completedServiceOrders]);

  const allWaiterOrders = useMemo(() => {
    const merged = new Map();
    for (const order of [...orderedServiceOrders, ...serviceHistoryOrders]) {
      merged.set(order.id, order);
    }
    return Array.from(merged.values());
  }, [orderedServiceOrders, serviceHistoryOrders]);

  const tableOptions = useMemo(() => Array.from(
    { length: Math.max(tableSummary.totalTables || 0, 12) },
    (_, index) => `T${index + 1}`
  ), [tableSummary.totalTables]);

  const billPreviewOrder = useMemo(
    () => allWaiterOrders.find((order) => order.id === billPreviewOrderId) || null,
    [allWaiterOrders, billPreviewOrderId]
  );

  const queueCounts = useMemo(() => ({
    incoming: kitchenOrders.filter((order) => order.status === "CONFIRMED").length,
    preparing: kitchenOrders.filter((order) => order.status === "PREPARING").length,
    ready: kitchenOrders.filter((order) => order.status === "READY").length,
    delayed: kitchenOrders.filter((order) => order.delayed).length
  }), [kitchenOrders]);

  const waiterCounts = useMemo(() => ({
    ready: readyServiceOrders.length,
    tablesWaiting: readyOrdersByTable.length,
    completed: serviceHistoryOrders.length,
    availableTables: tableSummary.availableTables
  }), [readyOrdersByTable.length, readyServiceOrders.length, serviceHistoryOrders.length, tableSummary.availableTables]);

  const runAction = async (key, callback) => {
    setPendingAction(key);
    setError("");
    try {
      await callback();
      await loadDashboard({ silent: true });
    } catch (err) {
      setError(err?.message || "Action failed");
    } finally {
      setPendingAction("");
    }
  };

  const updateKitchen = async (orderId, status) => {
    await runAction(`kitchen-${orderId}-${status}`, async () => {
      await updateStaffKitchenStatus(orderId, status, token);
    });
  };

  const updateBookingStatus = async (bookingId, payload) => {
    await runAction(`booking-${bookingId}-${payload.status || "assign"}`, async () => {
      await updateStaffBooking(bookingId, payload, token);
    });
  };

  const updateServiceOrder = async (orderId, action) => {
    await runAction(`service-${orderId}-${action}`, async () => {
      await updateStaffOrderService(orderId, action, token);
    });
  };

  const resolveWaiterAction = (order) => {
    if (order.serviceStage === "READY_TO_SERVE") {
      return { action: "SERVE", label: "Mark Served" };
    }
    if (order.serviceStage === "SERVED") {
      return { action: "GENERATE_BILL", label: "Generate Bill" };
    }
    if (order.serviceStage === "BILLED" && order.paymentMethod === "PAY_AT_CAFE") {
      return { action: "INITIATE_PAYMENT", label: "Initiate Payment" };
    }
    if (order.serviceStage === "BILLED" && order.paymentMethod === "ONLINE") {
      return { action: "COMPLETE_PAYMENT", label: "Close Order" };
    }
    if (order.serviceStage === "PAYMENT_PENDING") {
      return { action: "COMPLETE_PAYMENT", label: "Mark Paid" };
    }
    if (order.serviceStage === "PAID") {
      return { action: "COMPLETE_PAYMENT", label: "Close Order" };
    }
    return null;
  };

  const renderChefOrderCard = (order, { history = false } = {}) => {
    const nextStatus = order.status === "CONFIRMED" ? "PREPARING" : order.status === "PREPARING" ? "READY" : null;
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(order.createdAt)) / 60000));
    const timerTone = elapsedMinutes >= 12 ? "overdue" : elapsedMinutes >= 8 ? "warn" : "ok";
    const itemCount = order.itemCount || (order.lineItems || []).length || 0;
    const tableLabel = order.tableNumber || "Unassigned";
    const isUnassigned = tableLabel === "Unassigned";
    return (
      <motion.article
        key={`${history ? "history" : "live"}-${order.id}`}
        className={`kds-card status-${order.status.toLowerCase()} ${order.delayed ? "is-delayed" : ""}`}
        whileHover={{ y: -2 }}
        draggable={!history}
        onDragStart={(e) => {
          e.dataTransfer.setData("application/order-id", String(order.id));
          e.dataTransfer.setData("application/order-status", order.status);
        }}
      >
        <header className="kds-card-head">
          <div className="kds-table">
            <span className="kds-table-label">TABLE</span>
            <strong className={`kds-table-number ${isUnassigned ? "kds-table-number--muted" : ""}`}>
              {tableLabel}
            </strong>
            <div className="kds-order-meta">
              Order #{order.id} • {itemCount} item{itemCount === 1 ? "" : "s"} • {formatElapsedMinutes(elapsedMinutes, order.delayed)}
            </div>
          </div>
        </header>

        <ul className="kds-items">
          {(order.lineItems || []).map((item, index) => (
            <li key={`${order.id}-${item.itemName}-${index}`}>
              <span>{item.itemName}</span>
              <strong>×{item.quantity}</strong>
            </li>
          ))}
        </ul>

        {order.specialNotes && (
          <div className="kds-notes">
            <small>Notes</small>
            <p>{order.specialNotes}</p>
          </div>
        )}

        {history ? (
          <small className="staff-handoff-note">
            <BellRing size={13} /> Completed reference
          </small>
        ) : nextStatus ? (
          <PremiumButton
            variant="secondary"
            className="kds-action"
            disabled={pendingAction === `kitchen-${order.id}-${nextStatus}`}
            onClick={() => updateKitchen(order.id, nextStatus)}
          >
            <ChefHat size={14} />
            {order.status === "CONFIRMED" ? "Start Preparing →" : "Mark Ready →"}
          </PremiumButton>
        ) : (
          <small className="staff-handoff-note">
            <BellRing size={13} /> Waiting for waiter
          </small>
        )}
      </motion.article>
    );
  };

  const renderWaiterOrderCard = (order, { history = false } = {}) => {
    const waiterAction = history ? resolveWaiterAction(order) : { action: "SERVE", label: "Mark Served" };
    const quantity = totalOrderQuantity(order);
    const pulseReady = highlightReady.has(order.id);
    const statusKey = serviceStatusKey(order.serviceStage);
    return (
      <motion.article
        key={`${history ? "served" : "ready"}-${order.id}`}
        className={`waiter-card ${history ? "waiter-card-history" : ""} ${pulseReady ? "waiter-pulse" : ""}`}
        whileHover={{ y: -3 }}
      >
        <header className="waiter-card-head">
          <div className="waiter-card-title">
            <div className="waiter-order-id">ORD-{order.orderCode || order.id}</div>
            <div className="waiter-table-line"><Table size={13} /> Table {order.tableNumber || "Unassigned"}</div>
          </div>
          <span className={`status-pill ${statusKey}`}>{SERVICE_STAGE_LABELS[order.serviceStage] || order.serviceStage}</span>
        </header>

        <div className="waiter-meta">
          <span className="waiter-time"><Clock3 size={13} /> Prepared {formatOrderTime(order.readyAt || order.createdAt)}</span>
          <span className="waiter-qty">{quantity} items</span>
          <span className="waiter-total">Total: ₹{Number(order.totalAmount || 0).toFixed(2)}</span>
        </div>

        {history && order.servedAt && (
          <div className="waiter-served-note"><ConciergeBell size={13} /> Served {formatOrderTime(order.servedAt)}</div>
        )}

        <ul className="waiter-items">
          {(order.lineItems || []).map((item, index) => (
            <li key={`${order.id}-${item.itemName}-${index}`}>
              <span>{item.itemName}</span>
              <strong>x{item.quantity}</strong>
            </li>
          ))}
        </ul>

        <div className="waiter-actions">
          {history ? (
            <>
              <PremiumButton variant="secondary" disabled={pendingAction === `service-${order.id}-${waiterAction?.action || "GENERATE_BILL"}`} onClick={() => updateServiceOrder(order.id, waiterAction?.action || "GENERATE_BILL")}>
                <CreditCard size={14} /> {waiterAction?.label || "Generate Bill"}
              </PremiumButton>
              <PremiumButton variant="ghost" onClick={() => setBillPreviewOrderId(order.id)}>
                <Eye size={14} /> Preview Bill
              </PremiumButton>
            </>
          ) : waiterAction ? (
            <PremiumButton
              variant="secondary"
              className="waiter-primary-btn"
              disabled={pendingAction === `service-${order.id}-${waiterAction.action}`}
              onClick={() => updateServiceOrder(order.id, waiterAction.action)}
            >
              <ConciergeBell size={14} /> {waiterAction.label}
            </PremiumButton>
          ) : (
            <span className="waiter-time-note">Delivered and closed.</span>
          )}
        </div>
      </motion.article>
    );
  };

  if (loading) {
    return <div className="staff-shell"><div className="staff-loading">Loading staff dashboard...</div></div>;
  }

  return (
    <div className="staff-shell">
      <header className="staff-head">
        <div>
          <h1>{roleTitle}</h1>
          <p>
            {isChef
              ? "New orders appear here automatically. Move them through kitchen status and keep the pass flowing."
              : "See ready orders by table, mark deliveries as served, and track served order history."}
          </p>
        </div>
        <div className="staff-head-actions">
          <span className="staff-badge">{user?.role}</span>
          <PremiumButton className="staff-refresh" variant="ghost" onClick={() => loadDashboard({ silent: true })}>
            <RefreshCw size={14} /> Refresh
          </PremiumButton>
          <PremiumButton variant="ghost" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={15} /> Sign Out
          </PremiumButton>
        </div>
      </header>

      {error && <div className="staff-alert">{error}</div>}

      <PremiumCard className="staff-profile" hover={false}>
        <div className="staff-profile-avatar">{dashboard?.profile?.fullName?.[0] || "S"}</div>
        <div className="staff-profile-copy">
          <strong>{dashboard?.profile?.fullName || "Staff Member"}</strong>
          <p>{dashboard?.cafeName || "Cafe"} • {dashboard?.profile?.shift || "SHIFT"} • {dashboard?.profile?.status || "ACTIVE"}</p>
        </div>
      </PremiumCard>

      {isChef ? (
        <>
          <section className="staff-stats kds-stats">
            <PremiumCard className="staff-stat" hover={false}>
              <span>New</span>
              <strong>{queueCounts.incoming}</strong>
              <small>Waiting to start</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Preparing</span>
              <strong>{queueCounts.preparing}</strong>
              <small>On the line</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Ready</span>
              <strong>{queueCounts.ready}</strong>
              <small>Pickup queue</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Delayed</span>
              <strong>{queueCounts.delayed}</strong>
              <small>Over SLA</small>
            </PremiumCard>
          </section>

          <section className="chef-board kds-board">
            {groupedChefOrders.map((column) => (
              <div
                key={column.status}
                className={`chef-column kds-column status-${column.status.toLowerCase()}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const orderId = Number(e.dataTransfer.getData("application/order-id"));
                  const fromStatus = e.dataTransfer.getData("application/order-status");
                  if (column.status === "PREPARING" && fromStatus === "CONFIRMED") {
                    updateKitchen(orderId, "PREPARING");
                  }
                  if (column.status === "READY" && fromStatus === "PREPARING") {
                    updateKitchen(orderId, "READY");
                  }
                }}
              >
                <header>
                  <h3>{KITCHEN_LABELS[column.status]} ({column.items.length})</h3>
                </header>
                {column.items.length === 0 ? (
                  <div className="staff-empty">No orders here.</div>
                ) : (
                  <div className="kds-column-scroll">
                    {column.items.map((order) => renderChefOrderCard(order))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <div className="kds-footer">
            <PremiumButton variant="secondary" onClick={() => navigate("/staff/menu")}>
              Manage Menu
            </PremiumButton>
          </div>

          <section className="chef-secondary-grid">
            <PremiumCard className="chef-history-panel" hover={false}>
              <header className="waiter-panel-head">
                <div>
                  <h3>Previous Orders</h3>
                  <p>Completed kitchen tickets kept for quick reference.</p>
                </div>
                <span className="staff-badge">
                  <History size={13} /> {completedKitchenOrders.length}
                </span>
              </header>
              {completedKitchenOrders.length === 0 ? (
                <div className="staff-empty">No completed orders yet.</div>
              ) : (
                <div className="staff-list history-list">
                  {completedKitchenOrders.map((order) => renderChefOrderCard(order, { history: true }))}
                </div>
              )}
            </PremiumCard>
          </section>
        </>
      ) : (
        <>
          <section className="staff-stats waiter-stats">
            <PremiumCard className="staff-stat" hover={false}>
              <span>Ready Orders</span>
              <strong>{waiterCounts.ready}</strong>
              <small>Waiting at the pass</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Tables Waiting</span>
              <strong>{waiterCounts.tablesWaiting}</strong>
              <small>Grouped for quicker delivery</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Completed History</span>
              <strong>{waiterCounts.completed}</strong>
              <small>Served orders kept for reference</small>
            </PremiumCard>
            <PremiumCard className="staff-stat" hover={false}>
              <span>Available Tables</span>
              <strong>{waiterCounts.availableTables}</strong>
              <small>Out of {tableSummary.totalTables} tables</small>
            </PremiumCard>
          </section>

          <section className="waiter-primary-grid">
            <PremiumCard className="waiter-panel waiter-ready-panel" hover={false}>
              <header className="waiter-panel-head">
                <div>
                  <h3>Ready Orders</h3>
                  <p>Only chef-ready orders appear here, grouped by table for faster delivery.</p>
                </div>
                <span className="staff-badge">
                  <ConciergeBell size={13} /> {readyServiceOrders.length}
                </span>
              </header>
              {readyOrdersByTable.length === 0 ? (
                <div className="staff-empty">No ready orders waiting for delivery.</div>
              ) : (
                <div className="waiter-group-list">
                  {readyOrdersByTable.map((group) => (
                    <section key={group.tableNumber} className="waiter-table-group">
                      <div className="waiter-table-group-head">
                        <div>
                          <h4>{group.tableNumber}</h4>
                          <p>{group.orders.length} order{group.orders.length === 1 ? "" : "s"} ready to serve</p>
                        </div>
                        <span className="staff-badge">
                          <Table size={13} /> {group.totalQuantity} qty
                        </span>
                      </div>
                      <div className="service-list">
                        {group.orders.map((order) => renderWaiterOrderCard(order))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </PremiumCard>

            <PremiumCard className="waiter-panel waiter-history-panel" hover={false}>
              <header className="waiter-panel-head">
                <div>
                  <h3>Completed Orders</h3>
                  <p>Served orders move here automatically and stay visible for follow-up or reference.</p>
                </div>
                <span className="staff-badge">
                  <History size={13} /> {serviceHistoryOrders.length}
                </span>
              </header>
              {serviceHistoryOrders.length === 0 ? (
                <div className="staff-empty">No served orders in history yet.</div>
              ) : (
                <div className="service-list history-list">
                  {serviceHistoryOrders.map((order) => renderWaiterOrderCard(order, { history: true }))}
                </div>
              )}
            </PremiumCard>
          </section>

          <PremiumCard className="waiter-panel waiter-bookings-panel" hover={false}>
            <header className="waiter-panel-head">
              <div>
                <h3>Table Booking List</h3>
                <p>Today’s reservations and live table assignments.</p>
              </div>
              <div className="table-summary">
                <span>Available {tableSummary.availableTables}</span>
                <span>Reserved {tableSummary.reservedTables}</span>
                <span>Occupied {tableSummary.occupiedTables}</span>
                <span>Pending {tableSummary.pendingTables}</span>
              </div>
            </header>
            {bookings.length === 0 ? (
              <div className="staff-empty">No bookings for today.</div>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => {
                  const draftTable = bookingAssignments[booking.id] || "";
                  return (
                    <article key={booking.id} className="booking-card">
                      <div className="booking-main">
                        <div>
                          <strong>{booking.customerLabel}</strong>
                          <p>{booking.timeSlot} • Party of {booking.partySize}</p>
                          <small>{booking.seatingPreference || "No preference"}{booking.notes ? ` • ${booking.notes}` : ""}</small>
                        </div>
                        <span className={`staff-status booking ${booking.status.toLowerCase()}`}>
                          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </div>

                      <div className="booking-actions">
                        <select
                          className="staff-select"
                          value={draftTable}
                          onChange={(event) => setBookingAssignments((prev) => ({
                            ...prev,
                            [booking.id]: event.target.value
                          }))}
                        >
                          <option value="">Assign table</option>
                          {tableOptions.map((table) => (
                            <option key={table} value={table}>{table}</option>
                          ))}
                        </select>

                        <PremiumButton
                          variant="ghost"
                          disabled={pendingAction === `booking-${booking.id}-assign`}
                          onClick={() => updateBookingStatus(booking.id, { assignedTable: draftTable })}
                        >
                          Save Table
                        </PremiumButton>

                        {booking.status === "NEW" && (
                          <>
                            <PremiumButton
                              variant="secondary"
                              disabled={pendingAction === `booking-${booking.id}-CONFIRMED`}
                              onClick={() => updateBookingStatus(booking.id, {
                                status: "CONFIRMED",
                                assignedTable: draftTable || booking.assignedTable || null
                              })}
                            >
                              Confirm
                            </PremiumButton>
                            <PremiumButton
                              variant="danger"
                              disabled={pendingAction === `booking-${booking.id}-REJECTED`}
                              onClick={() => updateBookingStatus(booking.id, { status: "REJECTED" })}
                            >
                              Reject
                            </PremiumButton>
                          </>
                        )}

                        {booking.status === "CONFIRMED" && (
                          <>
                            <PremiumButton
                              variant="secondary"
                              disabled={pendingAction === `booking-${booking.id}-SEATED`}
                              onClick={() => updateBookingStatus(booking.id, {
                                status: "SEATED",
                                assignedTable: draftTable || booking.assignedTable || null
                              })}
                            >
                              Seat Guest
                            </PremiumButton>
                            <PremiumButton
                              variant="danger"
                              disabled={pendingAction === `booking-${booking.id}-REJECTED`}
                              onClick={() => updateBookingStatus(booking.id, { status: "REJECTED" })}
                            >
                              Reject
                            </PremiumButton>
                          </>
                        )}

                        {booking.status === "SEATED" && (
                          <PremiumButton
                            variant="secondary"
                            disabled={pendingAction === `booking-${booking.id}-COMPLETED`}
                            onClick={() => updateBookingStatus(booking.id, { status: "COMPLETED" })}
                          >
                            Close Table
                          </PremiumButton>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </PremiumCard>
        </>
      )}

      <PremiumModal
        open={Boolean(billPreviewOrderId && billPreviewOrder)}
        title={billPreviewOrder ? `Bill Preview · ${billPreviewOrder.orderCode}` : "Bill Preview"}
        subtitle={billPreviewOrder ? `${billPreviewOrder.customerName} · ${billPreviewOrder.tableNumber}` : ""}
        onClose={() => setBillPreviewOrderId(null)}
      >
        {billPreviewOrder && (
          <div className="bill-preview">
            <div className="bill-preview-top">
              <span className={`staff-status service ${billPreviewOrder.serviceStage.toLowerCase()}`}>
                {SERVICE_STAGE_LABELS[billPreviewOrder.serviceStage] || billPreviewOrder.serviceStage}
              </span>
              <span className="bill-preview-payment">
                {billPreviewOrder.paymentMethod === "ONLINE" ? "Online Payment" : "Pay at Cafe"}
              </span>
            </div>

            <div className="bill-preview-grid">
              <div>
                <span>Customer</span>
                <strong>{billPreviewOrder.customerName}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{billPreviewOrder.customerPhone}</strong>
              </div>
              <div>
                <span>Table</span>
                <strong>{billPreviewOrder.tableNumber}</strong>
              </div>
              <div>
                <span>Order</span>
                <strong>{billPreviewOrder.orderCode}</strong>
              </div>
            </div>

            <div className="bill-preview-lines">
              <div className="bill-preview-line bill-preview-line-head">
                <span>Item</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
              </div>
              {(billPreviewOrder.lineItems || []).map((item, index) => (
                <div key={`${billPreviewOrder.id}-${item.itemName}-${index}`} className="bill-preview-line">
                  <span>{item.itemName}</span>
                  <span>{item.quantity}</span>
                  <span>₹{Number(item.unitPrice || 0).toFixed(2)}</span>
                  <span>₹{Number(item.lineTotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bill-preview-totals">
              <div><span>Subtotal</span><strong>₹{Number(billPreviewOrder.subtotal || 0).toFixed(2)}</strong></div>
              <div><span>Tax</span><strong>₹{Number(billPreviewOrder.taxAmount || 0).toFixed(2)}</strong></div>
              <div className="grand-total"><span>Total</span><strong>₹{Number(billPreviewOrder.totalAmount || 0).toFixed(2)}</strong></div>
            </div>

            {resolveWaiterAction(billPreviewOrder) && (
              <div className="bill-preview-actions">
                <PremiumButton
                  variant="secondary"
                  disabled={pendingAction === `service-${billPreviewOrder.id}-${resolveWaiterAction(billPreviewOrder).action}`}
                  onClick={async () => {
                    await updateServiceOrder(billPreviewOrder.id, resolveWaiterAction(billPreviewOrder).action);
                    setBillPreviewOrderId(null);
                  }}
                >
                  <ConciergeBell size={14} /> {resolveWaiterAction(billPreviewOrder).label}
                </PremiumButton>
              </div>
            )}
          </div>
        )}
      </PremiumModal>
    </div>
  );
}
