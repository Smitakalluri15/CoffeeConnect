import SEO from "../components/common/SEO";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNearbyCafes, getPublicCafes, resolveMediaUrl } from "../api/api";
import "./HomePagePremium.css";

const services = [
  {
    icon: "☕",
    title: "Curated Brews",
    text: "Hand-picked coffee selections from premium roasters."
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    text: "Freshly brewed coffee delivered right to your doorstep."
  },
  {
    icon: "🧠",
    title: "Personalized Picks",
    text: "AI-powered recommendations based on your taste."
  },
  {
    icon: "📚",
    title: "Brew Guides",
    text: "Learn brewing methods from beginner to barista level."
  }
];

const fallbackCities = ["Hyderabad", "Mumbai", "Chennai", "Bengaluru", "Delhi"];
const HYDERABAD_FALLBACK = {
  latitude: 17.385,
  longitude: 78.4867,
  label: "Hyderabad",
  live: false
};

export default function HomePage() {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [distanceFilter, setDistanceFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [failedImages, setFailedImages] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("Detecting your location...");
  const [nearbyCafes, setNearbyCafes] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPublicCafes();
        setCafes(Array.isArray(data) ? data : []);
      } catch (error) {
        setCafes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const useFallback = (message) => {
      if (cancelled) return;
      setUserLocation(HYDERABAD_FALLBACK);
      setLocationMessage(message);
    };

    if (!navigator.geolocation) {
      useFallback("Location access is unavailable. Showing cafes near Hyderabad.");
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Your location",
          live: true
        });
        setLocationMessage("Showing cafes near your current location.");
      },
      () => {
        useFallback("Location access is off. Showing cafes near Hyderabad.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userLocation) return undefined;

    const loadNearby = async () => {
      setNearbyLoading(true);
      try {
        const data = await getNearbyCafes(userLocation.latitude, userLocation.longitude, {
          radiusKm: 20,
          limit: 6
        });
        if (!cancelled) {
          setNearbyCafes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setNearbyCafes([]);
        }
      } finally {
        if (!cancelled) {
          setNearbyLoading(false);
        }
      }
    };

    loadNearby();
    return () => {
      cancelled = true;
    };
  }, [userLocation]);

  const cafesWithMetrics = useMemo(() => {
    return cafes.map((cafe) => ({
      ...cafe,
      rating: deriveRating(cafe.id),
      distanceKm: resolveDistanceKm(cafe, userLocation),
      priceBand: derivePriceBand(cafe.id)
    }));
  }, [cafes, userLocation]);

  const filteredCafes = useMemo(() => {
    return cafesWithMetrics
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
      })
      .slice(0, 4);
  }, [cafesWithMetrics, search, ratingFilter, distanceFilter, priceFilter]);

  const nearbyCityList = useMemo(() => {
    const liveCities = Array.from(new Set(
      nearbyCafes
        .map((cafe) => cafe.city)
        .filter(Boolean)
    ));
    return (liveCities.length > 0 ? liveCities : fallbackCities).slice(0, 5);
  }, [nearbyCafes]);

  const mapMarkers = useMemo(() => buildMapMarkers(userLocation, nearbyCafes), [userLocation, nearbyCafes]);
  const primaryNearbyLabel = nearbyCafes[0]?.city || userLocation?.label || "Hyderabad";
  const nearbyCountLabel = nearbyLoading
    ? "Finding cafes near you..."
    : nearbyCafes.length > 0
      ? `${nearbyCafes.length} cafes within 20 km`
      : "No cafes found within 20 km";

  return (
    <div className="home-page-v2">
      <SEO
        title="Discover, Reserve & Order From Artisanal Cafes"
        description="Find top-rated artisanal cafes near you, reserve tables instantly, browse specialty coffee menus, and enjoy fresh brews with CoffeeConnect."
        keywords="coffee, cafes near me, book cafe table, artisanal coffee, espresso, specialty roasters, CoffeeConnect"
      />
      <section className="hero-v2 container">
        <div className="hero-copy">
          <span className="hero-kicker">Est. 2026 • The Future of Brewing</span>
          <h1>Brew Better Moments ☕</h1>
          <p>
            Experience premium coffee through CoffeeConnect. We blend technology with tradition
            to bring the finest cafe experience directly to your screen. Discover curated brews,
            personalized recommendations, and seamless ordering — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-dark">Start Your Journey</Link>
            <Link to="/login" className="btn-light">Member Login</Link>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
              alt="Coffee cups"
            />
          </div>
        </div>
      </section>

      <section className="entry-v2 container">
        <div className="entry-head">
          <h2>Customer Entry (POC)</h2>
          <p>Search cafes, apply filters, and open cafe details to book table or view menu.</p>
        </div>
        <div className="entry-controls">
          <input
            className="entry-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cafe name / location"
          />
          <select className="entry-input" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="">Rating</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
          <select className="entry-input" value={distanceFilter} onChange={(e) => setDistanceFilter(e.target.value)}>
            <option value="">Distance</option>
            <option value="3">Within 3 km</option>
            <option value="8">Within 8 km</option>
            <option value="15">Within 15 km</option>
          </select>
          <select className="entry-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="">Price Range</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
          <Link to="/cafes" className="btn-dark">Browse Cafes</Link>
        </div>

        <div className="entry-featured-grid">
          {loading ? (
            <div className="entry-empty">Loading featured cafes...</div>
          ) : filteredCafes.length === 0 ? (
            <div className="entry-empty">No cafes found for selected filters.</div>
          ) : (
            filteredCafes.map((cafe) => (
              <article key={cafe.id} className="entry-cafe-card">
                <div className="entry-cafe-media">
                  {resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl) && !failedImages[cafe.id] ? (
                    <img
                      src={resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl)}
                      alt={cafe.cafeName}
                      onError={() => setFailedImages((prev) => ({ ...prev, [cafe.id]: true }))}
                    />
                  ) : (
                    <div className="entry-cafe-fallback">{(cafe.cafeName || "Cafe").slice(0, 1)}</div>
                  )}
                </div>
                <div className="entry-cafe-body">
                  <h3>{cafe.cafeName}</h3>
                  <p>{cafe.city}, {cafe.state}</p>
                  <div className="entry-cafe-meta">
                    <span>⭐ {cafe.rating.toFixed(1)}</span>
                    <span>{cafe.distanceKm.toFixed(1)} km</span>
                    <span>{cafe.priceBand}</span>
                  </div>
                  <Link to={`/cafes/${cafe.id}`} className="btn-light">View Details</Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="about-v2 container">
        <h2>About CoffeeConnect</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              CoffeeConnect is built for coffee lovers who value quality, convenience, and
              community. We partner with premium cafes and roasters to bring authentic brewing
              experiences to your home.
            </p>
            <p>
              Our platform blends modern technology with the warmth of cafe culture. Whether
              you&apos;re a casual drinker or a coffee connoisseur, CoffeeConnect helps you explore
              flavors, learn brewing techniques, and connect with local cafes.
            </p>
          </div>

          <div className="stats-grid">
            <article>
              <strong>1K+</strong>
              <span>Happy Users</span>
            </article>
            <article>
              <strong>50+</strong>
              <span>Partner Cafes</span>
            </article>
            <article>
              <strong>120+</strong>
              <span>Premium Brews</span>
            </article>
          </div>
        </div>
      </section>

      <section className="services-v2 container">
        <h2>Our Services</h2>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.title} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="nearby-v2 container">
        <h2>Find Cafes Near You ☕📍</h2>
        <p className="nearby-sub">
          Discover partner cafes around you and explore premium brews in your city.
        </p>
        <p className="nearby-note">{locationMessage}</p>

        <div className="nearby-grid">
          <article className="nearby-map-card">
            <header>
              <span>📍 Nearby Cafes</span>
              <small>{userLocation?.live ? "Live" : "Fallback"}</small>
            </header>
            <div className="map-box">
              {mapMarkers.length === 0 ? (
                <div className="map-box-empty">Waiting for location data...</div>
              ) : (
                mapMarkers.map((marker) => (
                  <span
                    key={marker.key}
                    className={`map-marker ${marker.type}`}
                    style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
                    title={marker.label}
                  >
                    {marker.type === "user" ? "📍" : "☕"}
                  </span>
                ))
              )}
            </div>
            <footer>
              <div>
                <strong>{primaryNearbyLabel}</strong>
                <p>{nearbyCountLabel}</p>
              </div>
              <button type="button" onClick={() => navigate("/cafes")}>Explore</button>
            </footer>
          </article>

          <article className="nearby-text-card">
            <h3>We&apos;re brewing across cities</h3>
            <p>
              CoffeeConnect now uses your real location to find nearby cafes and sort them by actual distance.
              Open the cafe list to explore the closest options around you.
            </p>
            <div className="city-grid">
              {nearbyCityList.map((city) => (
                <span key={city}>📍 {city}</span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function deriveRating(id) {
  const bucket = Number(id % 5);
  return 4.1 + bucket * 0.15;
}

function derivePriceBand(id) {
  const bucket = Number(id % 3);
  if (bucket === 0) return "$";
  if (bucket === 1) return "$$";
  return "$$$";
}

function resolveDistanceKm(cafe, userLocation) {
  if (typeof cafe.distanceKm === "number") {
    return cafe.distanceKm;
  }
  if (
    userLocation
    && typeof cafe.latitude === "number"
    && typeof cafe.longitude === "number"
  ) {
    return calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      cafe.latitude,
      cafe.longitude
    );
  }
  return 1.2 + Number(cafe.id % 9) * 1.1;
}

function calculateDistanceKm(sourceLat, sourceLng, targetLat, targetLng) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(targetLat - sourceLat);
  const dLng = toRadians(targetLng - sourceLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRadians(sourceLat)) * Math.cos(toRadians(targetLat))
    * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function buildMapMarkers(userLocation, nearbyCafes) {
  const cafeMarkers = nearbyCafes
    .filter((cafe) => typeof cafe.latitude === "number" && typeof cafe.longitude === "number")
    .map((cafe) => ({
      key: `cafe-${cafe.id}`,
      label: cafe.cafeName,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      type: "cafe"
    }));

  const points = [];
  if (userLocation?.latitude && userLocation?.longitude) {
    points.push({
      key: "user-location",
      label: userLocation.label || "Your location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      type: "user"
    });
  }
  points.push(...cafeMarkers);

  if (points.length === 0) {
    return [];
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = Math.max(maxLat - minLat, 0.02);
  const lngRange = Math.max(maxLng - minLng, 0.02);

  return points.map((point) => ({
    ...point,
    left: 12 + ((point.longitude - minLng) / lngRange) * 76,
    top: 18 + (1 - ((point.latitude - minLat) / latRange)) * 58
  }));
}
