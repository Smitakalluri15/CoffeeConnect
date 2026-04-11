import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicCafes, resolveMediaUrl } from "../api/api";
import "./CustomerFlow.css";

export default function CafeListingPage() {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [failedImages, setFailedImages] = useState({});

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

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-hero-card">
          <div className="customer-hero-top">
            <h1>Find Cafes Near You</h1>
            <p>
              Browse cafes, apply filters, and open a cafe profile to book a table or explore the menu.
            </p>
          </div>
          <div className="customer-search-grid">
            <input
              className="customer-input"
              placeholder="Search by cafe name or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <button type="button" className="customer-btn light" onClick={() => navigate("/dashboard")}>
              Customer Hub
            </button>
          </div>
        </section>

        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>Cafe Listing</h2>
              <p>{filtered.length} cafes match your filters.</p>
            </div>
            <Link to="/booking" className="customer-btn ghost">Book Table</Link>
          </div>

          {error && <div className="customer-state">{error}</div>}
          {loading ? (
            <div className="customer-state">Loading cafes...</div>
          ) : filtered.length === 0 ? (
            <div className="customer-state">No cafes found for the selected filters.</div>
          ) : (
            <div className="cafe-list-grid">
              {filtered.map((cafe) => {
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
                      <div className="cafe-meta-tags">
                        <span>{formatCafeType(cafe.cafeType)}</span>
                        <span>{cafe.openNow ? "Open" : "Closed"}</span>
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

function formatCafeType(value) {
  if (!value) return "Cafe";
  return String(value).replaceAll("_", " ");
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
