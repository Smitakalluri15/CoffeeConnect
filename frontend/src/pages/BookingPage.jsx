import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking, getMyBookings, getPublicCafes, resolveMediaUrl } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./BookingPage.css";

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
  "08:00 PM", "09:00 PM"
];

const tableTypes = [
  {
    id: "INDOOR_STANDARD_2",
    label: "Indoor Standard (2-Seater)",
    capacity: [2],
    image: "/table-types/indoor-standard.webp"
  },
  {
    id: "INDOOR_FAMILY_4",
    label: "Indoor Family (4-Seater)",
    capacity: [4],
    image: "/table-types/indoor-family.jpeg"
  },
  {
    id: "INDOOR_GROUP_6",
    label: "Indoor Group (6-Seater)",
    capacity: [6],
    image: "/table-types/indoor-group.avif"
  },
  {
    id: "WINDOW_2",
    label: "Window Table (2-Seater)",
    capacity: [2],
    image: "/table-types/window-table.jpg"
  },
  {
    id: "OUTDOOR_PATIO_2_4",
    label: "Outdoor Patio (2/4-Seater)",
    capacity: [2, 4],
    image: "/table-types/outdoor-patio.webp"
  },
  {
    id: "BOOTH_SOFA_4",
    label: "Booth Sofa (4-Seater)",
    capacity: [4],
    image: "/table-types/booth-sofa.jpg"
  },
  {
    id: "BAR_COUNTER_1_2",
    label: "Bar Counter Stools (1/2-Seater)",
    capacity: [1, 2],
    image: "/table-types/bar-counter.jpg"
  },
  {
    id: "PRIVATE_CORNER_4_6",
    label: "Private Corner (4/6-Seater)",
    capacity: [4, 6],
    image: "/table-types/private-corner.jpeg"
  }
];

const bookingSteps = [
  { id: 1, title: "Choose Cafe", subtitle: "Select your favorite place" },
  { id: 2, title: "Date & Table", subtitle: "Choose date, time, and seats" },
  { id: 3, title: "Review & Confirm", subtitle: "Add notes and submit booking" }
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedCafeId = searchParams.get("cafeId");
  const [cafes, setCafes] = useState([]);
  const [cafesLoading, setCafesLoading] = useState(true);
  const [cafesError, setCafesError] = useState("");
  const [cafeId, setCafeId] = useState("");
  const [step, setStep] = useState(1);
  const [lockedCafeSelection, setLockedCafeSelection] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [tableTypeId, setTableTypeId] = useState(tableTypes[0].id);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);
  const [myBookingsError, setMyBookingsError] = useState("");

  useEffect(() => {
    const load = async () => {
      setCafesLoading(true);
      setCafesError("");
      try {
        const data = await getPublicCafes();
        const list = Array.isArray(data) ? data : [];
        setCafes(list);
        setFailedImages({});
        if (requestedCafeId && list.some((cafe) => String(cafe.id) === requestedCafeId)) {
          setCafeId(requestedCafeId);
          setLockedCafeSelection(true);
          setStep(2);
        } else if (list.length > 0) {
          setCafeId(String(list[0].id));
          setLockedCafeSelection(false);
          setStep(1);
        } else {
          setLockedCafeSelection(false);
        }
      } catch (err) {
        setCafesError(err?.message || "Failed to load cafes.");
      } finally {
        setCafesLoading(false);
      }
    };
    load();
  }, [requestedCafeId]);

  useEffect(() => {
    if (!status?.message) return;
    const timer = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!token) return;
    loadMyBookings();
  }, [token]);

  const selectedCafe = useMemo(
    () => cafes.find((cafe) => String(cafe.id) === cafeId) || null,
    [cafes, cafeId]
  );
  const selectedTableType = useMemo(
    () => tableTypes.find((table) => table.id === tableTypeId) || null,
    [tableTypeId]
  );
  const canSubmit = useMemo(
    () => Boolean(cafeId && date && time && partySize >= 1 && selectedTableType),
    [cafeId, date, time, partySize, selectedTableType]
  );

  useEffect(() => {
    if (!selectedTableType || isTableSupported(selectedTableType, partySize)) {
      return;
    }
    const fallback = tableTypes.find((table) => isTableSupported(table, partySize));
    if (fallback) {
      setTableTypeId(fallback.id);
    }
  }, [partySize, selectedTableType]);

  const loadMyBookings = () => {
    setMyBookingsLoading(true);
    setMyBookingsError("");
    getMyBookings(token)
      .then((data) => setMyBookings(Array.isArray(data) ? data : []))
      .catch((err) => setMyBookingsError(err?.message || "Failed to load bookings."))
      .finally(() => setMyBookingsLoading(false));
  };

  const handleCheck = () => {
    if (!date || !time) {
      setStatus({ type: "info", message: "Select a date and time to check availability." });
      return;
    }
    setStatus({ type: "success", message: "Availability looks open for your selected slot." });
  };

  const handleNext = () => {
    if (lockedCafeSelection && step === 1) {
      setStep(2);
      return;
    }
    if (step === 1 && !cafeId) {
      setStatus({ type: "info", message: "Please select a cafe to continue." });
      return;
    }
    if (step === 2 && !(date && time && partySize >= 1 && selectedTableType)) {
      setStatus({ type: "info", message: "Please complete date, time, party size and table type to continue." });
      return;
    }
    setStep((current) => Math.min(current + 1, bookingSteps.length));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, lockedCafeSelection ? 2 : 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (step !== 3) return;
    if (!canSubmit || !cafeId) return;
    const payload = {
      cafeOwnerId: Number(cafeId),
      bookingDate: date,
      timeSlot: time,
      partySize,
      seatingPreference: selectedTableType?.label || null,
      notes
    };
    createBooking(payload, token)
      .then((response) => {
        setStatus({ type: "success", message: `Booking confirmed. ID #${response.id}` });
        loadMyBookings();
      })
      .catch((err) => setStatus({ type: "error", message: err?.message || "Failed to create booking." }));
  };

  return (
    <div className="booking-page">
      <div className="booking-header">
        <div>
          <h1 className="booking-title">Reserve a Table</h1>
          <p className="booking-subtitle">Pick a date and time to lock in your coffee moment.</p>
        </div>
        <button className="booking-btn ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {status?.message && <div className={`booking-alert ${status.type}`}>{status.message}</div>}
      {cafesError && <div className="booking-alert error">{cafesError}</div>}

      <div className="booking-card">
        <form onSubmit={handleSubmit}>
          <div className="booking-stepper" aria-label="Booking steps">
            {bookingSteps.map((item) => {
              const stateClass = step === item.id ? "active" : step > item.id ? "done" : "";
              return (
                <div key={item.id} className={`booking-step ${stateClass}`}>
                  <span className="booking-step-index">{item.id}</span>
                  <div>
                    <p className="booking-step-title">{item.title}</p>
                    <p className="booking-step-subtitle">{item.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {lockedCafeSelection && selectedCafe && (
            <section className="booking-step-panel booking-locked-cafe">
              <h3>Selected Cafe</h3>
              <div className="booking-summary">
                <div className="booking-summary-row">
                  <span>Cafe</span>
                  <strong>{selectedCafe.cafeName}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Location</span>
                  <strong>{[selectedCafe.city, selectedCafe.state].filter(Boolean).join(", ")}</strong>
                </div>
              </div>
            </section>
          )}

          {step === 1 && !lockedCafeSelection && (
            <section className="booking-step-panel">
              <h3>Choose your cafe</h3>
              <div className="cafe-picker" role="radiogroup" aria-label="Choose cafe">
                {cafesLoading && <div className="cafe-picker-state">Loading cafes...</div>}
                {!cafesLoading && cafes.length === 0 && (
                  <div className="cafe-picker-state">No cafes are available right now.</div>
                )}
                {!cafesLoading &&
                  cafes.map((cafe) => {
                    const selected = cafeId === String(cafe.id);
                    const imageUrl = resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl);
                    const services = [
                      cafe.hasDineIn ? "Dine-in" : null,
                      cafe.hasTakeaway ? "Takeaway" : null,
                      cafe.hasHomeDelivery ? "Delivery" : null
                    ].filter(Boolean);
                    return (
                      <button
                        key={cafe.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`cafe-option ${selected ? "selected" : ""}`}
                        onClick={() => setCafeId(String(cafe.id))}
                      >
                        <div className="cafe-option-media">
                          {imageUrl && !failedImages[cafe.id] ? (
                            <img
                              src={imageUrl}
                              alt={`${cafe.cafeName} cover`}
                              onError={() => setFailedImages((prev) => ({ ...prev, [cafe.id]: true }))}
                            />
                          ) : (
                            <div className="cafe-option-fallback">
                              {(cafe.cafeName || "Cafe").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <span className={`cafe-open-state ${cafe.openNow ? "open" : "closed"}`}>
                            {cafe.openNow ? "Open now" : "Closed"}
                          </span>
                        </div>
                        <div className="cafe-option-body">
                          <div className="cafe-option-top">
                            <h3>{cafe.cafeName}</h3>
                            <p>{[cafe.city, cafe.state].filter(Boolean).join(", ")}</p>
                          </div>
                          <p className="cafe-option-desc">
                            {cafe.description || "A cozy place for coffee, conversations, and good food."}
                          </p>
                          <div className="cafe-option-tags">
                            {cafe.cafeType && <span>{String(cafe.cafeType).replaceAll("_", " ")}</span>}
                            {services.map((service) => (
                              <span key={`${cafe.id}-${service}`}>{service}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="booking-step-panel">
              <h3>Select date and table details</h3>
              <div className="booking-grid">
                <div className="booking-field">
                  <label>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="booking-field">
                  <label>Time Slot</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="">Select a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="booking-field">
                  <label>Party Size</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                  />
                </div>
                <div className="booking-field full">
                  <label>Seating Preference</label>
                  <div className="table-type-grid">
                    {tableTypes.map((tableType) => {
                      const isSelected = tableType.id === tableTypeId;
                      const supported = isTableSupported(tableType, partySize);
                      return (
                        <button
                          key={tableType.id}
                          type="button"
                          className={`table-type-card ${isSelected ? "selected" : ""} ${!supported ? "disabled" : ""}`}
                          onClick={() => setTableTypeId(tableType.id)}
                        >
                          <div className="table-type-media">
                            <img src={tableType.image} alt={tableType.label} />
                          </div>
                          <div className="table-type-body">
                            <strong>{tableType.label}</strong>
                            <span>Seats: {tableType.capacity.join("/")}</span>
                            {!supported && <small>Not ideal for {partySize} guests</small>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="booking-inline-actions">
                <button type="button" className="booking-btn ghost" onClick={handleCheck}>
                  Check Availability
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="booking-step-panel">
              <h3>Review booking details</h3>
              <div className="booking-summary">
                <div className="booking-summary-row">
                  <span>Cafe</span>
                  <strong>{selectedCafe ? `${selectedCafe.cafeName} (${selectedCafe.city})` : "Not selected"}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Date & Time</span>
                  <strong>{date && time ? `${date} at ${time}` : "Not selected"}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Party & Seating</span>
                  <strong>{`${partySize} guests • ${selectedTableType?.label || "Not selected"}`}</strong>
                </div>
              </div>
              <div className="booking-field full">
                <label>Special Requests</label>
                <textarea
                  rows="4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergies, celebrations, or seating notes..."
                />
              </div>
            </section>
          )}

          <div className="booking-actions">
            {step > (lockedCafeSelection ? 2 : 1) && (
              <button type="button" className="booking-btn ghost" onClick={handleBack}>
                Back
              </button>
            )}
            {step < bookingSteps.length && (
              <button type="button" className="booking-btn primary" onClick={handleNext}>
                Continue
              </button>
            )}
            {step === bookingSteps.length && (
              <button type="submit" className="booking-btn primary" disabled={!canSubmit}>
                Book Table
              </button>
            )}
          </div>
        </form>

        <div className="booking-info">
          <div className="booking-info-card">
            <h4>What happens next?</h4>
            <p>We will confirm your reservation and send a status update.</p>
          </div>
          <div className="booking-info-card">
            <h4>Need changes?</h4>
            <p>Update your booking any time before the selected slot.</p>
          </div>
        </div>
      </div>

      <div className="booking-card">
        <div className="booking-step-panel">
          <h3>My Bookings</h3>
          {myBookingsError && <div className="booking-alert error">{myBookingsError}</div>}
          {myBookingsLoading ? (
            <div className="cafe-picker-state">Loading bookings...</div>
          ) : myBookings.length === 0 ? (
            <div className="cafe-picker-state">No bookings yet.</div>
          ) : (
            <div className="booking-summary">
              {myBookings.slice(0, 6).map((booking) => (
                <div key={booking.id} className="booking-summary-row">
                  <span>
                    #{booking.id} · {booking.cafeName} · {booking.bookingDate} · {booking.timeSlot}
                  </span>
                  <strong>{booking.status}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function isTableSupported(tableType, guests) {
  const maxSeats = Math.max(...tableType.capacity);
  return guests <= maxSeats;
}
