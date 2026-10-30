import SEO from "../components/common/SEO";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCafeDetails, resolveMediaUrl } from "../api/api";
import { getGoogleMapsApiKey, loadGoogleMapsApi } from "../utils/googleMaps";
import "./CustomerFlow.css";

export default function CafeProfilePage() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverFailed, setCoverFailed] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (!cafeId) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCafeDetails(cafeId);
        setCafe(data);
      } catch (err) {
        setCafe(null);
        setError(err?.message || "Failed to load cafe profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cafeId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationEnabled(true);
      },
      () => {
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const address = useMemo(() => {
    if (!cafe) return "";
    return [cafe.street, cafe.landmark, cafe.city, cafe.state, cafe.pincode]
      .filter(Boolean)
      .join(", ");
  }, [cafe]);

  const mapConfig = useMemo(() => {
    if (!cafe) return null;
    return buildMapConfig(cafe.latitude, cafe.longitude, cafe.cafeName, userLocation);
  }, [cafe, userLocation]);

  const distanceInfo = useMemo(() => {
    if (!cafe) return { label: "Distance unavailable", helper: "Cafe coordinates are missing." };
    return buildDistanceInfo(userLocation, cafe.latitude, cafe.longitude, locationEnabled);
  }, [cafe, userLocation, locationEnabled]);

  const seoData = useMemo(() => {
    if (!cafe) {
      return {
        title: "Cafe Profile",
        description: "Explore cafe menus, ambiance, and table bookings on CoffeeConnect."
      };
    }
    const coverImage = resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl);
    const cafeCity = cafe.city ? " in " + cafe.city : "";
    return {
      title: cafe.cafeName + cafeCity + " - Menu & Table Booking",
      description: cafe.description || ("Reserve a table and enjoy artisanal coffee at " + cafe.cafeName + cafeCity + ". View menu, ratings, and location."),
      ogImage: coverImage || undefined,
      ogType: "restaurant",
      schema: {
        "@context": "https://schema.org",
        "@type": "CafeOrCoffeeShop",
        "name": cafe.cafeName,
        "description": cafe.description || ("Artisanal coffee and cafe experiences at " + cafe.cafeName),
        "image": coverImage || undefined,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": cafe.street || undefined,
          "addressLocality": cafe.city || undefined,
          "addressRegion": cafe.state || undefined,
          "postalCode": cafe.pincode || undefined
        },
        "telephone": cafe.phone || undefined,
        "aggregateRating": cafe.rating ? {
          "@type": "AggregateRating",
          "ratingValue": Number(cafe.rating).toFixed(1),
          "reviewCount": cafe.reviewCount || 1
        } : undefined
      }
    };
  }, [cafe]);

  useEffect(() => {
    if (!mapConfig || !mapRef.current) return undefined;
    if (!mapConfig.mapAvailable) {
      setMapError(mapConfig.reason || "Google Maps JavaScript API key is not configured.");
      setMapLoading(false);
      return undefined;
    }

    let cancelled = false;
    let cafeMarker = null;
    let customerMarker = null;

    setMapError("");
    setMapLoading(true);

    loadGoogleMapsApi()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: mapConfig.center,
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
          styles: GOOGLE_MAP_STYLES
        });

        cafeMarker = createMapMarker(window.google, map, mapConfig.center, cafe?.cafeName || "Cafe", "cafe");

        const bounds = new maps.LatLngBounds();
        bounds.extend(mapConfig.center);

        if (mapConfig.userPosition) {
          customerMarker = createMapMarker(window.google, map, mapConfig.userPosition, "You", "user");
          bounds.extend(mapConfig.userPosition);
          map.fitBounds(bounds, 72);
          maps.event.addListenerOnce(map, "idle", () => {
            if (!cancelled && map.getZoom() > 16) {
              map.setZoom(16);
            }
          });
        }

        if (!cancelled) {
          setMapLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setMapLoading(false);
        setMapError(err?.message || "Failed to load Google Maps JavaScript API.");
      });

  return () => {
      cancelled = true;
      if (cafeMarker) {
        cafeMarker.map = null;
      }
      if (customerMarker) {
        customerMarker.map = null;
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }
    };
  }, [mapConfig, cafe?.cafeName]);

  return (
    <div className="customer-page">
      <SEO
        title={seoData.title}
        description={seoData.description}
        ogImage={seoData.ogImage}
        ogType={seoData.ogType}
        schema={seoData.schema}
      />
      <div className="customer-shell">
        {loading ? (
          <div className="customer-state">Loading cafe profile...</div>
        ) : error ? (
          <div className="customer-state">{error}</div>
        ) : !cafe ? (
          <div className="customer-state">Cafe not found.</div>
        ) : (
          <>
            <section className="customer-panel">
              <div className="customer-panel-head">
                <div>
                  <h2>{cafe.cafeName}</h2>
                  <p>{cafe.description || "A warm place for coffee and conversations."}</p>
                </div>
                <div className="flow-chips">
                  <span>⭐ {Number(cafe.rating || 0).toFixed(1)}</span>
                  <span>{cafe.reviewCount || 0} reviews</span>
                  <span>{cafe.openNow ? "Open Now" : "Closed"}</span>
                </div>
              </div>

              <div className="profile-action-row">
                <button className="customer-btn profile-action-btn" onClick={() => navigate(`/booking?cafeId=${cafe.id}`)}>
                  Book Table
                </button>
                <button className="customer-btn light profile-action-btn" onClick={() => navigate(`/cafes/${cafe.id}/menu`)}>
                  View Menu
                </button>
              </div>

              <div className="customer-grid-two">
                <div className="cafe-cover">
                  {resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl) && !coverFailed ? (
                    <img
                      src={resolveMediaUrl(cafe.coverImageUrl || cafe.cafeLogoUrl)}
                      alt={cafe.cafeName}
                      onError={() => setCoverFailed(true)}
                    />
                  ) : (
                    <div className="cafe-list-fallback">Cafe Image</div>
                  )}
                </div>
                <div className="detail-list">
                  <div className="detail-item">
                    <span>Opening Hours</span>
                    <strong>{formatTime(cafe.openingTime)} - {formatTime(cafe.closingTime)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Location</span>
                    <strong>{address || "Address not available"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Distance</span>
                    <strong>{distanceInfo.label}</strong>
                    <small className="detail-item-helper">{distanceInfo.helper}</small>
                    <small className="detail-item-helper">{distanceInfo.etaLabel}</small>
                  </div>
                  <div className="detail-item">
                    <span>Available Seats</span>
                    <strong>{cafe.availableSeats || 0} seats now</strong>
                  </div>
                  <div className="detail-item">
                    <span>Services</span>
                    <strong>{buildServices(cafe)}</strong>
                  </div>
                  <div className="detail-item detail-item-map">
                    <div className="detail-item-map-head">
                      <span>Map</span>
                      {mapConfig?.externalUrl ? (
                        <div className="detail-map-links">
                          <a
                            href={mapConfig.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="detail-map-link"
                          >
                            Open Map
                          </a>
                          <a
                            href={mapConfig.directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`detail-map-link ${!locationEnabled ? "disabled" : ""}`}
                            aria-disabled={!locationEnabled}
                            onClick={(event) => {
                              if (!locationEnabled) {
                                event.preventDefault();
                              }
                            }}
                          >
                            Get Directions
                          </a>
                        </div>
                      ) : null}
                    </div>
                    {mapConfig ? (
                      <>
                        <div className="cafe-map-frame">
                          {mapError ? (
                            <div className="detail-map-empty detail-map-empty-full">
                              <strong>{mapError}</strong>
                              <small>Enable `Maps JavaScript API` for your key and verify HTTP referrer restrictions.</small>
                            </div>
                          ) : (
                            <>
                              <div ref={mapRef} className="cafe-map-canvas" aria-label={`${cafe.cafeName} location map`} />
                              {mapLoading ? (
                                <div className="detail-map-loading">Loading live map...</div>
                              ) : null}
                            </>
                          )}
                        </div>
                        <div className="detail-map-meta">
                          <strong>{address || "Address not available"}</strong>
                          <small>{mapConfig.coordinatesLabel}</small>
                          <small>{distanceInfo.label}</small>
                          <small>{distanceInfo.etaLabel}</small>
                          <small>{locationEnabled ? "Directions use your current location." : "Allow location access to enable directions."}</small>
                        </div>
                      </>
                    ) : (
                      <strong>Map coordinates unavailable</strong>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="customer-panel">
              <div className="customer-panel-head">
                <div>
                  <h2>Ratings & Reviews</h2>
                  <p>Customer sentiment snapshot</p>
                </div>
              </div>
              <div className="detail-list">
                <div className="detail-item">
                  <span>Overall Rating</span>
                  <strong>{Number(cafe.rating || 0).toFixed(1)} / 5</strong>
                </div>
                <div className="detail-item">
                  <span>Review Count</span>
                  <strong>{cafe.reviewCount || 0} reviews</strong>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(value) {
  if (!value) return "--";
  return String(value).slice(0, 5);
}

function buildServices(cafe) {
  const list = [];
  if (cafe.hasDineIn) list.push("Dine-in");
  if (cafe.hasTakeaway) list.push("Takeaway");
  if (cafe.hasHomeDelivery) list.push("Delivery");
  return list.length > 0 ? list.join(" • ") : "Not specified";
}

function buildMapConfig(latitude, longitude, cafeName, userLocation) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const apiKey = getGoogleMapsApiKey();
  const query = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const center = { lat, lng };
  const userPosition = userLocation
    && Number.isFinite(Number(userLocation.latitude))
    && Number.isFinite(Number(userLocation.longitude))
    ? {
      lat: Number(userLocation.latitude),
      lng: Number(userLocation.longitude)
    }
    : null;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const directionsUrl = buildDirectionsUrl(lat, lng, cafeName, userLocation);

  if (!apiKey) {
    return {
      mapAvailable: false,
      center,
      userPosition,
      externalUrl,
      directionsUrl,
      coordinatesLabel: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      reason: "Google Maps API key is not configured."
    };
  }

  return {
    mapAvailable: true,
    center,
    userPosition,
    externalUrl,
    directionsUrl,
    coordinatesLabel: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  };
}

function buildDirectionsUrl(latitude, longitude, cafeName, userLocation) {
  const destination = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const destinationLabel = encodeURIComponent(cafeName || "Cafe");
  if (
    userLocation
    && Number.isFinite(Number(userLocation.latitude))
    && Number.isFinite(Number(userLocation.longitude))
  ) {
    const origin = `${Number(userLocation.latitude).toFixed(6)},${Number(userLocation.longitude).toFixed(6)}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${destinationLabel}%20${destination}`;
}

function buildDistanceInfo(userLocation, cafeLatitude, cafeLongitude, locationEnabled) {
  const lat = Number(cafeLatitude);
  const lng = Number(cafeLongitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      label: "Distance unavailable",
      helper: "Cafe coordinates are missing.",
      etaLabel: "Travel time unavailable"
    };
  }

  if (
    !userLocation
    || !Number.isFinite(Number(userLocation.latitude))
    || !Number.isFinite(Number(userLocation.longitude))
  ) {
    return {
      label: "Distance unavailable",
      helper: locationEnabled ? "Waiting for your live location." : "Allow location access to calculate distance.",
      etaLabel: "Travel time unavailable"
    };
  }

  const distanceKm = calculateDistanceKm(
    Number(userLocation.latitude),
    Number(userLocation.longitude),
    lat,
    lng
  );
  const etaLabel = buildEtaLabel(distanceKm);

  if (distanceKm < 1) {
    return {
      label: `${Math.max(50, Math.round(distanceKm * 1000))} m away`,
      helper: "Calculated from your current location.",
      etaLabel
    };
  }

  return {
    label: `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away`,
    helper: "Calculated from your current location.",
    etaLabel
  };
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function toRadians(value) {
  return value * (Math.PI / 180);
}

function buildEtaLabel(distanceKm) {
  const averageCitySpeedKmPerHour = 22;
  const minutes = Math.max(3, Math.round((distanceKm / averageCitySpeedKmPerHour) * 60));
  return `Approx. ${minutes} min drive`;
}

function createMapMarker(googleApi, map, position, label, type) {
  const markerClass = type === "user" ? "gm-marker gm-marker-user" : "gm-marker gm-marker-cafe";
  const markerContent = document.createElement("div");
  markerContent.className = markerClass;
  markerContent.innerHTML = `
    <span class="gm-marker-dot"></span>
    <span class="gm-marker-label">${escapeHtml(label)}</span>
  `;

  return new googleApi.maps.Marker({
    map,
    position,
    title: label,
    label: {
      text: label.slice(0, 1).toUpperCase(),
      color: "#fff7ed",
      fontWeight: "700"
    },
    icon: {
      path: googleApi.maps.SymbolPath.CIRCLE,
      fillColor: type === "user" ? "#1caf9a" : "#6b3f2d",
      fillOpacity: 1,
      strokeColor: "#f6bf7c",
      strokeWeight: 3,
      scale: 11
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const GOOGLE_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f7f1e8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6d5848" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fff9f2" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#d8c2ad" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#efe1d1" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#d9ead9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e8d6c2" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dec0a0" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ecdcca" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d9e7eb" }] }
];
