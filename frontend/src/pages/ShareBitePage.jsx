import "./../styles/sharebite.css";
import { ArrowRight, Heart, MapPin, Clock3, ShieldCheck, UploadCloud, Sparkles, Users } from "lucide-react";

const heroStats = [
  { label: "Meals Shared", value: "1.2M", delta: "+8% this week" },
  { label: "Food Saved", value: "820K kg", delta: "+12% MoM" },
  { label: "Active Volunteers", value: "42,300", delta: "4,200 on duty" }
];

const flows = [
  {
    title: "Donate Food",
    chips: ["Cooked Meals", "Bakery", "Fresh Produce"],
    body: "Schedule a pickup in 45 seconds with smart time slots, image uploads, and auto-location.",
    icon: <UploadCloud size={18} />
  },
  {
    title: "Request Support",
    chips: ["Shelters", "Community Fridges", "NGOs"],
    body: "Browse nearby surplus, reserve instantly, and get route guidance for pickup.",
    icon: <MapPin size={18} />
  },
  {
    title: "Volunteer Route",
    chips: ["Claim tasks", "Live ETA", "Proof of delivery"],
    body: "Optimized pickups with live status, milestones, and kindness-first messaging.",
    icon: <ShieldCheck size={18} />
  }
];

const screenTiles = [
  { title: "Splash", subtitle: "“Donate Food. Share Hope.”", badge: "Warm welcome" },
  { title: "Auth", subtitle: "Password + social login", badge: "Secure" },
  { title: "Dashboard", subtitle: "Donate / Request actions", badge: "Hero CTA" },
  { title: "Donate Form", subtitle: "Type, qty, image, slot", badge: "Guided" },
  { title: "Map", subtitle: "Nearby surplus with filters", badge: "Contextual" },
  { title: "Volunteer", subtitle: "Tasks, progress, stats", badge: "Operational" },
  { title: "Profile", subtitle: "Identity + impact trail", badge: "Trust" }
];

export default function ShareBitePage() {
  return (
    <div className="sharebite-page">
      <div className="sb-ambient sb-ambient-a" />
      <div className="sb-ambient sb-ambient-b" />

      <header className="sb-hero">
        <div className="sb-hero-text">
          <p className="sb-kicker">Premium UI / UX Concept</p>
          <h1>
            ShareBite — Reduce food waste.
            <br />
            <span>Feed communities with warmth.</span>
          </h1>
          <p className="sb-sub">
            A calm, human-centered experience with floating glass cards, warm gradients, and emotionally kind micro-interactions. Built to feel like it belongs at Apple,
            Stripe, or Airbnb.
          </p>
          <div className="sb-actions">
            <button className="sb-btn sb-btn-primary">
              Donate Food <ArrowRight size={16} />
            </button>
            <button className="sb-btn sb-btn-ghost">Preview Request Flow</button>
          </div>
          <div className="sb-hero-stats">
            {heroStats.map((item) => (
              <div key={item.label} className="sb-stat-card">
                <div className="sb-stat-label">{item.label}</div>
                <div className="sb-stat-value">{item.value}</div>
                <div className="sb-stat-delta">{item.delta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sb-hero-visual">
          <div className="sb-hero-card">
            <div className="sb-hero-card__header">
              <div className="sb-pill sb-pill-soft">
                <Heart size={14} /> Live Donation
              </div>
              <span className="sb-time">02:15 PM pickup</span>
            </div>
            <div className="sb-hero-card__body">
              <div className="sb-food-chip">Fresh Veggie Bowls · 24 servings</div>
              <div className="sb-meta-row">
                <div className="sb-meta">
                  <MapPin size={15} /> 1.8 km away
                </div>
                <div className="sb-meta">
                  <Clock3 size={15} /> Ready in 20 min
                </div>
              </div>
              <div className="sb-progress">
                <div className="sb-progress-bar" style={{ width: "68%" }} />
              </div>
              <div className="sb-avatar-row">
                <div className="sb-avatars">
                  <span className="sb-avatar sb-avatar-1" />
                  <span className="sb-avatar sb-avatar-2" />
                  <span className="sb-avatar sb-avatar-3" />
                </div>
                <span className="sb-muted">3 volunteers nearby</span>
              </div>
            </div>
          </div>

          <div className="sb-floating-card sb-floating-right">
            <div className="sb-pill sb-pill-success">
              <Users size={14} /> Volunteer Route
            </div>
            <p className="sb-floating-title">Route optimized</p>
            <div className="sb-route">
              <div className="sb-route-step">
                <span className="sb-dot active" />
                <div>
                  <p>Pickup — Green Cafe</p>
                  <small>5 mins • QR handoff</small>
                </div>
                <span className="sb-chip">In 8 min</span>
              </div>
              <div className="sb-route-step">
                <span className="sb-dot" />
                <div>
                  <p>Deliver — Hope Shelter</p>
                  <small>7 mins • Proof photo</small>
                </div>
                <span className="sb-chip ghost">Queued</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="sb-section sb-grid-3">
        {flows.map((flow) => (
          <div key={flow.title} className="sb-card sb-hover">
            <div className="sb-card-top">
              <div className="sb-icon">{flow.icon}</div>
              <h3>{flow.title}</h3>
              <p>{flow.body}</p>
            </div>
            <div className="sb-chip-row">
              {flow.chips.map((chip) => (
                <span key={chip} className="sb-chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="sb-section sb-dual">
        <div className="sb-card sb-form-card">
          <div className="sb-form-header">
            <div className="sb-pill sb-pill-soft">
              <Sparkles size={14} /> Donate Form
            </div>
            <p>Guided, calm, and trust-building.</p>
          </div>
          <div className="sb-form-grid">
            <div className="sb-field">
              <label>Food type</label>
              <div className="sb-pill-options">
                <span className="active">Cooked</span>
                <span>Produce</span>
                <span>Bakery</span>
              </div>
            </div>
            <div className="sb-field">
              <label>Quantity</label>
              <div className="sb-qty">
                <button>-</button>
                <span>24</span>
                <button>+</button>
              </div>
            </div>
            <div className="sb-field">
              <label>Pickup time</label>
              <div className="sb-input sb-inline">
                <Clock3 size={16} />
                <span>Today, 2:30 PM</span>
              </div>
            </div>
            <div className="sb-field">
              <label>Location</label>
              <div className="sb-input sb-inline">
                <MapPin size={16} />
                <span>91 Market Street, 3rd Floor</span>
              </div>
            </div>
            <div className="sb-field sb-upload">
              <label>Upload image</label>
              <div className="sb-dropzone">
                <UploadCloud size={18} />
                <div>
                  <p>Drag & drop or click to upload</p>
                  <small>JPG/PNG up to 10MB</small>
                </div>
                <span className="sb-chip ghost">+ Add label</span>
              </div>
            </div>
          </div>
          <div className="sb-form-footer">
            <div className="sb-pill sb-pill-success">Safety checked</div>
            <button className="sb-btn sb-btn-primary">
              Submit donation <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="sb-card sb-map-card">
          <div className="sb-map-header">
            <div className="sb-pill sb-pill-soft">
              <MapPin size={14} /> Nearby surplus
            </div>
            <div className="sb-chip-row">
              <span className="sb-chip ghost">Hot meals</span>
              <span className="sb-chip ghost">Bakery</span>
              <span className="sb-chip ghost">Veg</span>
            </div>
          </div>
          <div className="sb-map-preview">
            <div className="sb-pin pin-1" />
            <div className="sb-pin pin-2" />
            <div className="sb-pin pin-3" />
          </div>
          <div className="sb-map-list">
            <div className="sb-map-item">
              <div>
                <p>Sunrise Deli</p>
                <small>12 wraps • 1.1 km</small>
              </div>
              <span className="sb-chip">Claim</span>
            </div>
            <div className="sb-map-item">
              <div>
                <p>Green Bowl Kitchen</p>
                <small>18 salads • 2.0 km</small>
              </div>
              <span className="sb-chip ghost">Queued</span>
            </div>
            <div className="sb-map-item">
              <div>
                <p>Community Bakery</p>
                <small>30 bagels • 2.4 km</small>
              </div>
              <span className="sb-chip">Claim</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sb-section">
        <div className="sb-section-header">
          <h3>Screen system</h3>
          <p>Seven cohesive screens with consistent gradients, glass cards, and outlined icons.</p>
        </div>
        <div className="sb-screen-grid">
          {screenTiles.map((tile) => (
            <div key={tile.title} className="sb-screen-card">
              <div className="sb-pill sb-pill-soft">{tile.badge}</div>
              <h4>{tile.title}</h4>
              <p>{tile.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sb-section sb-cta">
        <div>
          <p className="sb-kicker">Ready to ship</p>
          <h3>Production-ready component system.</h3>
          <p className="sb-sub">Buttons, cards, chips, skeletons, and glass overlays tuned for ShareBite’s gradient identity.</p>
        </div>
        <div className="sb-cta-actions">
          <button className="sb-btn sb-btn-primary">
            Launch Demo <ArrowRight size={16} />
          </button>
          <button className="sb-btn sb-btn-ghost">View component tokens</button>
        </div>
      </section>
    </div>
  );
}
