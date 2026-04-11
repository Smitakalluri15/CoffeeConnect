import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getMyBookings, getMyOrders, getMyProfile, getPublicCafes, resolveMediaUrl } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getCartCount } from "../utils/cart";
import "./CustomerFlow.css";

const FLOW_STEPS = [
  "Landing",
  "Browse Cafes",
  "Select Cafe",
  "Book Table / View Menu",
  "Add to Cart",
  "Checkout",
  "Confirmation"
];

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="customer-page"><div className="customer-shell"><div className="customer-state">Loading...</div></div></div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "CAFE_OWNER") return <Navigate to="/owner" replace />;
  if (user.role === "CHEF" || user.role === "WAITER") return <Navigate to="/staff" replace />;

  return <CustomerLanding />;
}

function CustomerLanding() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [cartCount, setCartCount] = useState(getCartCount());
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const syncCart = () => setCartCount(getCartCount());
    window.addEventListener("cart-updated", syncCart);
    return () => window.removeEventListener("cart-updated", syncCart);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicCafes();
        setCafes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to load cafes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setActivityLoading(true);
      setActivityError("");
      try {
        const [profileRes, bookingsRes, ordersRes] = await Promise.allSettled([
          getMyProfile(token),
          getMyBookings(token),
          getMyOrders(token)
        ]);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value);
        if (bookingsRes.status === "fulfilled") setBookings(Array.isArray(bookingsRes.value) ? bookingsRes.value : []);
        if (ordersRes.status === "fulfilled") setOrders(Array.isArray(ordersRes.value) ? ordersRes.value : []);
        if (profileRes.status === "rejected" || bookingsRes.status === "rejected" || ordersRes.status === "rejected") {
          setActivityError("Some dashboard activity data could not be loaded.");
        }
      } finally {
        setActivityLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = useMemo(() => {
    return cafes
      .map((cafe) => ({
        ...cafe,
        rating: deriveRating(cafe.id),
        distanceKm: deriveDistance(cafe.id),
        priceBand: derivePriceBand(cafe.id)
      }))
      .filter((cafe) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query
          || cafe.cafeName?.toLowerCase().includes(query)
          || cafe.city?.toLowerCase().includes(query)
          || cafe.state?.toLowerCase().includes(query);
        const matchesRating = !ratingFilter || cafe.rating >= Number(ratingFilter);
        const matchesDistance = !distanceFilter || cafe.distanceKm <= Number(distanceFilter);
        const matchesPrice = !priceFilter || cafe.priceBand === priceFilter;
        return matchesSearch && matchesRating && matchesDistance && matchesPrice;
      });
  }, [cafes, search, ratingFilter, distanceFilter, priceFilter]);

  const featured = filtered.slice(0, 6);
  const upcomingBookings = bookings.slice(0, 4);
  const recentOrders = orders.slice(0, 4);
  const completion = profile?.completionPercent ?? 0;
  const firstName = profile?.firstName || (user?.email ? user.email.split("@")[0] : "Customer");

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-hero-card">
          <div className="customer-hero-top">
            <h1>Welcome</h1>
            <p>Search cafes, view details, book a table, add items, and checkout.</p>
          </div>

          <div className="customer-search-grid">
            <input
              className="customer-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cafe name / location"
            />
            <select className="customer-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="">Rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
            <select className="customer-select" value={distanceFilter} onChange={(e) => setDistanceFilter(e.target.value)}>
              <option value="">Distance</option>
              <option value="3">Within 3 km</option>
              <option value="8">Within 8 km</option>
              <option value="15">Within 15 km</option>
            </select>
            <select className="customer-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
              <option value="">Price Range</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
            <button className="customer-btn" onClick={() => navigate("/cafes")}>Browse All Cafes</button>
          </div>

          <div className="flow-chips">
            {FLOW_STEPS.map((step) => <span key={step}>{step}</span>)}
            <button className="customer-btn light" onClick={() => navigate("/cart")}>Cart ({cartCount})</button>
          </div>
        </section>

        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Your Dashboard</h2>
              <p>Profile, bookings, orders, and quick account actions.</p>
            </div>
            <div className="flow-chips">
              <button className="customer-btn ghost" onClick={() => navigate("/profile")}>Edit Profile</button>
              <button className="customer-btn light" onClick={() => navigate("/booking")}>Book Table</button>
            </div>
          </div>

          {activityError && <div className="customer-state">{activityError}</div>}
          {activityLoading ? (
            <div className="customer-state">Loading account activity...</div>
          ) : (
            <div className="customer-grid-two">
              <div className="summary-card">
                <div className="summary-row">
                  <span>Welcome</span>
                  <strong>{formatName(firstName)}</strong>
                </div>
                <div className="summary-row">
                  <span>Profile Completion</span>
                  <strong>{completion}%</strong>
                </div>
                <div className="summary-row">
                  <span>Total Bookings</span>
                  <strong>{bookings.length}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total Orders</span>
                  <strong>{orders.length}</strong>
                </div>
                <button className="customer-btn" onClick={() => navigate("/profile")}>Update Profile</button>
              </div>

              <div className="detail-list">
                <div className="detail-item">
                  <span>Upcoming / Recent Bookings</span>
                  {upcomingBookings.length === 0 ? (
                    <strong>No bookings yet</strong>
                  ) : (
                    <ul className="customer-mini-list">
                      {upcomingBookings.map((booking) => (
                        <li key={booking.id}>
                          <strong>#{booking.id}</strong> {booking.cafeName} · {booking.bookingDate} {booking.timeSlot} · {booking.status}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="detail-item">
                  <span>Recent Orders</span>
                  {recentOrders.length === 0 ? (
                    <strong>No orders yet</strong>
                  ) : (
                    <ul className="customer-mini-list">
                      {recentOrders.map((order) => (
                        <li key={order.id}>
                          <strong>#{order.id}</strong> {order.cafeName} · ₹{Number(order.totalAmount || 0).toFixed(2)} · {order.status}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flow-chips">
                  <button className="customer-btn ghost" onClick={() => navigate("/cart")}>Open Cart</button>
                  <button className="customer-btn ghost" onClick={() => navigate("/orders")}>Previous Orders</button>
                  <button className="customer-btn ghost" onClick={() => navigate("/cafes")}>Browse Cafes</button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Featured Cafes</h2>
              <p>Select a cafe to open profile and continue the flow.</p>
            </div>
            <button className="customer-btn ghost" onClick={() => navigate("/booking")}>
              Book Table
            </button>
          </div>

          {error && <div className="customer-state">{error}</div>}
          {loading ? (
            <div className="customer-state">Loading featured cafes...</div>
          ) : featured.length === 0 ? (
            <div className="customer-state">No cafes found for current filters.</div>
          ) : (
            <div className="cafe-list-grid">
              {featured.map((cafe) => {
                const image = resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl);
                return (
                  <article key={cafe.id} className="cafe-list-card">
                    <div className="cafe-list-media">
                      {image && !failedImages[cafe.id] ? (
                        <img
                          src={image}
                          alt={cafe.cafeName}
                          onError={() => setFailedImages((prev) => ({ ...prev, [cafe.id]: true }))}
                        />
                      ) : (
                        <div className="cafe-list-fallback">{(cafe.cafeName || "Cafe").slice(0, 1)}</div>
                      )}
                    </div>
                    <div className="cafe-list-body">
                      <h3>{cafe.cafeName}</h3>
                      <div className="cafe-meta-line">
                        <span>{cafe.city}, {cafe.state}</span>
                        <span>⭐ {cafe.rating.toFixed(1)}</span>
                      </div>
                      <div className="cafe-meta-line">
                        <span>{cafe.distanceKm.toFixed(1)} km</span>
                        <span>{cafe.priceBand}</span>
                      </div>
                      <button className="customer-btn" onClick={() => navigate(`/cafes/${cafe.id}`)}>
                        View Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatName(value) {
  return String(value || "Customer")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function deriveRating(id) {
  const bucket = Number(id % 5);
  return 4.1 + bucket * 0.15;
}

function deriveDistance(id) {
  return 1.2 + Number(id % 9) * 1.1;
}

function derivePriceBand(id) {
  const bucket = Number(id % 3);
  if (bucket === 0) return "$";
  if (bucket === 1) return "$$";
  return "$$$";
}
