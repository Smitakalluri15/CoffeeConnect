import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getOwnerBookings, updateOwnerBookingStatus } from "../../api/api";

const STATUS_LABELS = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  SEATED: "Seated",
  COMPLETED: "Completed",
  REJECTED: "Rejected"
};

export default function OwnerBookings() {
  const { token } = useOutletContext();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOwnerBookings(token);
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const visibleBookings = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await updateOwnerBookingStatus(id, status, token);
      setBookings((prev) => prev.map((booking) => (booking.id === id ? updated : booking)));
    } catch (err) {
      setError(err?.message || "Failed to update booking.");
    }
  };

  return (
    <div className="owner-page">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Bookings</h2>
            <p>Manage table reservations from customers.</p>
          </div>
        </div>

        <div className="action-row">
          {["ALL", "NEW", "CONFIRMED", "SEATED", "COMPLETED", "REJECTED"].map((key) => (
            <button
              key={key}
              type="button"
              className={`action-chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {key === "ALL" ? "All" : STATUS_LABELS[key]}
            </button>
          ))}
        </div>

        {error && <div className="owner-alert">{error}</div>}
        {loading ? (
          <div className="owner-state">Loading bookings...</div>
        ) : visibleBookings.length === 0 ? (
          <div className="owner-state">No bookings found.</div>
        ) : (
          <div className="owner-table">
            <div className="owner-table-row owner-table-head">
              <span>Guest</span>
              <span>Date</span>
              <span>Time</span>
              <span>Party</span>
              <span>Preference</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {visibleBookings.map((booking) => (
              <div key={booking.id} className="owner-table-row">
                <div>
                  <strong>{booking.userEmail}</strong>
                  <small>{booking.cafeName}</small>
                  {booking.notes && <small className="muted-note">{booking.notes}</small>}
                </div>
                <span>{booking.bookingDate}</span>
                <span>{booking.timeSlot}</span>
                <span>{booking.partySize}</span>
                <span>{booking.seatingPreference || "--"}</span>
                <span className={`status-pill ${booking.status === "REJECTED" ? "rejected" : booking.status === "COMPLETED" ? "live" : ""}`}>
                  {STATUS_LABELS[booking.status]}
                </span>
                <div className="table-actions">
                  {booking.status === "NEW" && (
                    <>
                      <button className="ghost-btn" onClick={() => updateStatus(booking.id, "CONFIRMED")}>Confirm</button>
                      <button className="ghost-btn danger" onClick={() => updateStatus(booking.id, "REJECTED")}>Reject</button>
                    </>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <>
                      <button className="ghost-btn" onClick={() => updateStatus(booking.id, "SEATED")}>Mark Seated</button>
                      <button className="ghost-btn danger" onClick={() => updateStatus(booking.id, "REJECTED")}>Reject</button>
                    </>
                  )}
                  {booking.status === "SEATED" && (
                    <button className="ghost-btn" onClick={() => updateStatus(booking.id, "COMPLETED")}>Complete</button>
                  )}
                  {booking.status === "COMPLETED" && (
                    <span className="owner-state">Done</span>
                  )}
                  {booking.status === "REJECTED" && (
                    <span className="owner-state">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
