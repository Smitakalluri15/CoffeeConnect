import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addMenuItem,
  createMenuCategory,
  deleteMenuCategory,
  deleteMenuItem,
  getCafeOwnerMe,
  getOwnerMenuCategories,
  updateCafeVisibility,
  updateMenuCategory,
  updateMenuItem,
  updateMenuItemAvailability
} from "../api/api";
import "./CafeOwnerDashboard.css";

const FALLBACK_TEXT = "—";

const formatTime = (value) => {
  if (!value) return FALLBACK_TEXT;
  const [hh, mm] = String(value).split(":");
  if (!hh || !mm) return value;
  const hour = Number(hh);
  if (Number.isNaN(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${mm} ${period}`;
};

const formatDate = (value) => {
  if (!value) return FALLBACK_TEXT;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return FALLBACK_TEXT;
  return date.toLocaleDateString();
};

const formatStatus = (value) => {
  if (!value) return FALLBACK_TEXT;
  return String(value).replace(/_/g, " ").toLowerCase();
};

const capitalize = (value) => {
  if (!value) return FALLBACK_TEXT;
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

export default function CafeOwnerDashboard() {
  const { user, loading, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [itemDrafts, setItemDrafts] = useState({});
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const quickActions = [
    { label: "Add Menu Item", target: "menu-section" },
    { label: "Add Category", target: "menu-section" },
    { label: "View Today’s Orders", target: "orders-section" },
    { label: "View Table Bookings", target: "bookings-section" },
    { label: "Update Cafe Details", target: "details-section" }
  ];

  const displayName = useMemo(() => {
    if (profile?.cafeName) return profile.cafeName;
    if (profile?.ownerName) return `${profile.ownerName}'s Cafe`;
    return "Your Cafe";
  }, [profile]);

  const ownerLabel = useMemo(() => {
    if (profile?.ownerName) return profile.ownerName;
    if (user?.email) return user.email.split("@")[0];
    return "Owner";
  }, [profile, user]);

  const initials = useMemo(() => {
    const name = displayName || ownerLabel || "Cafe";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName, ownerLabel]);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;

    const loadProfile = async () => {
      setDataLoading(true);
      setError("");
      try {
        const data = await getCafeOwnerMe(token);
        if (active) {
          setProfile(data);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Failed to load cafe owner profile.");
        }
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    if (profile?.status && profile.status !== "ACTIVE") {
      setMenuCategories([]);
      setMenuLoading(false);
      setMenuError("");
      return undefined;
    }
    let active = true;

    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError("");
      try {
        const data = await getOwnerMenuCategories(token);
        if (active) {
          const categories = Array.isArray(data) ? data : [];
          setMenuCategories(categories.map((category) => ({
            ...category,
            items: Array.isArray(category.items) ? category.items : []
          })));
        }
      } catch (err) {
        if (active) {
          setMenuError(err?.message || "Failed to load menu.");
        }
      } finally {
        if (active) {
          setMenuLoading(false);
        }
      }
    };

    loadMenu();
    return () => {
      active = false;
    };
  }, [token, profile?.status]);

  if (loading) {
    return (
      <div className="owner-loading">
        Brewing your dashboard ☕...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="owner-loading error">
        Not logged in
      </div>
    );
  }

  const serviceModes = [
    { label: "Home Delivery", value: Boolean(profile?.hasHomeDelivery) },
    { label: "Takeaway", value: Boolean(profile?.hasTakeaway) },
    { label: "Dine-in", value: Boolean(profile?.hasDineIn) }
  ];

  const activeServices = serviceModes.filter((service) => service.value).length;
  const status = profile?.status;
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const isApproved = status === "ACTIVE";

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleVisibilityToggle = async () => {
    if (!profile || visibilityLoading) return;
    try {
      setVisibilityLoading(true);
      const updated = await updateCafeVisibility(!profile.cafeVisible, token);
      setProfile(updated);
    } catch (err) {
      setError(err?.message || "Failed to update visibility.");
    } finally {
      setVisibilityLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setMenuError("Category name is required.");
      return;
    }
    try {
      const saved = await createMenuCategory(newCategory, token);
      setMenuCategories((prev) => [...prev, saved]);
      setNewCategory({ name: "", description: "" });
      setMenuError("");
    } catch (err) {
      setMenuError(err?.message || "Failed to add category.");
    }
  };

  const handleEditCategory = async (category) => {
    const name = window.prompt("Category name", category.name);
    if (!name) return;
    const description = window.prompt("Category description", category.description || "");
    try {
      const updated = await updateMenuCategory(category.id, { name, description }, token);
      setMenuCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    } catch (err) {
      setMenuError(err?.message || "Failed to update category.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm("Delete this category and its items?");
    if (!confirmed) return;
    try {
      await deleteMenuCategory(categoryId, token);
      setMenuCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setMenuError(err?.message || "Failed to delete category.");
    }
  };

  const updateItemDraft = (categoryId, field, value) => {
    setItemDrafts((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], [field]: value }
    }));
  };

  const handleAddItem = async (categoryId) => {
    const draft = itemDrafts[categoryId] || {};
    if (!draft.name || draft.price === undefined || draft.price === "") {
      setMenuError("Item name and price are required.");
      return;
    }
    const payload = {
      name: draft.name,
      price: Number(draft.price),
      description: draft.description || null,
      imageUrl: draft.imageUrl || null,
      veg: Boolean(draft.veg),
      available: draft.available !== false
    };
    try {
      const saved = await addMenuItem(categoryId, payload, token);
      setMenuCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, items: [...c.items, saved] } : c))
      );
      setItemDrafts((prev) => ({ ...prev, [categoryId]: { name: "", price: "", veg: true, available: true } }));
    } catch (err) {
      setMenuError(err?.message || "Failed to add item.");
    }
  };

  const handleEditItem = async (item, categoryId) => {
    const name = window.prompt("Item name", item.name);
    if (!name) return;
    const price = window.prompt("Item price", item.price);
    if (!price) return;
    const description = window.prompt("Item description", item.description || "");
    try {
      const updated = await updateMenuItem(item.id, {
        name,
        price: Number(price),
        description,
        imageUrl: item.imageUrl,
        veg: item.veg,
        available: item.available
      }, token);
      setMenuCategories((prev) =>
        prev.map((c) => c.id === categoryId
          ? { ...c, items: c.items.map((i) => (i.id === item.id ? updated : i)) }
          : c
        )
      );
    } catch (err) {
      setMenuError(err?.message || "Failed to update item.");
    }
  };

  const handleToggleAvailability = async (item, categoryId) => {
    try {
      const updated = await updateMenuItemAvailability(item.id, !item.available, token);
      setMenuCategories((prev) =>
        prev.map((c) => c.id === categoryId
          ? { ...c, items: c.items.map((i) => (i.id === item.id ? updated : i)) }
          : c
        )
      );
    } catch (err) {
      setMenuError(err?.message || "Failed to update availability.");
    }
  };

  const handleDeleteItem = async (itemId, categoryId) => {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;
    try {
      await deleteMenuItem(itemId, token);
      setMenuCategories((prev) =>
        prev.map((c) => c.id === categoryId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
        )
      );
    } catch (err) {
      setMenuError(err?.message || "Failed to delete item.");
    }
  };

  return (
    <div className="owner-dash">
      <div className="owner-hero">
        <div className="owner-hero-top">
          <div className="owner-identity">
            <div className="owner-avatar">{initials}</div>
            <div>
              <div className="owner-kicker">Cafe Owner</div>
              <h1>{displayName}</h1>
              <p>Manage your cafe profile, services, and compliance at a glance.</p>
            </div>
          </div>
          <div className="owner-actions">
            <button className="owner-btn subtle" onClick={logout}>Sign Out</button>
          </div>
        </div>

        <div className="owner-metrics">
          <div className="owner-metric">
            <div className="metric-label">Cafe Status</div>
            <div className="metric-value">{capitalize(formatStatus(profile?.status))}</div>
            <div className="metric-sub">Current listing state</div>
          </div>
          <div className="owner-metric">
            <div className="metric-label">Verification</div>
            <div className="metric-value">{capitalize(formatStatus(profile?.verificationStatus))}</div>
            <div className="metric-sub">FSSAI & KYC checks</div>
          </div>
          <div className="owner-metric">
            <div className="metric-label">Service Modes</div>
            <div className="metric-value">{activeServices} / 3</div>
            <div className="metric-sub">Delivery, takeaway, dine-in</div>
          </div>
          <div className="owner-metric">
            <div className="metric-label">Hours</div>
            <div className="metric-value">{formatTime(profile?.openingTime)} - {formatTime(profile?.closingTime)}</div>
            <div className="metric-sub">{profile?.openNow ? "Open now" : "Closed now"}</div>
          </div>
        </div>
      </div>

      {isApproved && (
        <div className="owner-alert approved">
          ✅ Approved. Cafe Live:
          <button
            type="button"
            className={`toggle-btn ${profile?.cafeVisible ? "on" : "off"}`}
            onClick={handleVisibilityToggle}
            disabled={visibilityLoading}
          >
            {profile?.cafeVisible ? "Visible" : "Hidden"}
          </button>
        </div>
      )}

      {isPending && (
        <div className="owner-alert pending">
          ⏳ Your cafe registration is pending admin approval.
        </div>
      )}

      {isRejected && (
        <div className="owner-alert rejected">
          ❌ Your cafe registration was rejected. {profile?.rejectionReason || "Please update the details and resubmit."}
        </div>
      )}

      {dataLoading && (
        <div className="owner-state">Loading cafe profile...</div>
      )}

      {error && (
        <div className="owner-alert">{error}</div>
      )}

      {!dataLoading && !error && (
        <div className="owner-grid">
          <section className="owner-panel wide">
            <header className="owner-panel-header">
              <div>
                <h2>Quick Actions</h2>
                <p>Jump to key tasks.</p>
              </div>
            </header>
            <div className="owner-panel-body action-row">
              {quickActions.map((action) => (
                <button key={action.label} type="button" className="action-chip" onClick={() => scrollToSection(action.target)}>
                  {action.label}
                </button>
              ))}
            </div>
          </section>

          <section className="owner-panel wide" id="details-section">
            <header className="owner-panel-header">
              <div>
                <h2>Cafe Details</h2>
                <p>Primary contact and location information.</p>
              </div>
              <span className="owner-pill">Registered {formatDate(profile?.registrationDate)}</span>
            </header>
            <div className="owner-panel-body detail-grid">
              <div className="detail-item">
                <span>Cafe Name</span>
                <strong>{profile?.cafeName || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Brand Name</span>
                <strong>{profile?.brandName || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Cafe Type</span>
                <strong>{profile?.cafeType ? capitalize(formatStatus(profile.cafeType)) : FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Opening Date</span>
                <strong>{formatDate(profile?.openingDate)}</strong>
              </div>
              <div className="detail-item">
                <span>Description</span>
                <strong>{profile?.description || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Owner Name</span>
                <strong>{profile?.ownerName || ownerLabel}</strong>
              </div>
              <div className="detail-item">
                <span>Owner Email</span>
                <strong>{profile?.email || user?.email || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Owner Phone</span>
                <strong>{profile?.contactNumber || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Cafe Contact</span>
                <strong>{profile?.cafeContactNumber || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Cafe Email</span>
                <strong>{profile?.cafeEmail || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>WhatsApp</span>
                <strong>{profile?.whatsappNumber || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Address</span>
                <strong>
                  {profile?.street ? `${profile.street}, ${profile.city}` : FALLBACK_TEXT}
                </strong>
              </div>
              <div className="detail-item">
                <span>Landmark</span>
                <strong>{profile?.landmark || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>State</span>
                <strong>{profile?.state || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>Pincode</span>
                <strong>{profile?.pincode || FALLBACK_TEXT}</strong>
              </div>
            </div>
          </section>

          <section className="owner-panel">
            <header className="owner-panel-header">
              <div>
                <h2>Business & Compliance</h2>
                <p>Legal and business credentials.</p>
              </div>
            </header>
            <div className="owner-panel-body detail-stack">
              <div className="detail-item">
                <span>FSSAI License</span>
                <strong>{profile?.fssaiLicenseNumber || FALLBACK_TEXT}</strong>
              </div>
              <div className="detail-item">
                <span>GST Number</span>
                <strong>{profile?.gstNumber || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>License Document</span>
                <strong>{profile?.licenseDocumentUrl || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Shop Photo</span>
                <strong>{profile?.shopPhotoUrl || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Owner ID Proof</span>
                <strong>{profile?.ownerIdProofUrl || "Not provided"}</strong>
              </div>
            </div>
          </section>

          <section className="owner-panel">
            <header className="owner-panel-header">
              <div>
                <h2>Payments</h2>
                <p>Payout-ready information.</p>
              </div>
            </header>
            <div className="owner-panel-body detail-stack">
              <div className="detail-item">
                <span>Accept Cash</span>
                <strong>{profile?.acceptCash ? "Yes" : "No"}</strong>
              </div>
              <div className="detail-item">
                <span>UPI ID</span>
                <strong>{profile?.upiId || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Account Holder</span>
                <strong>{profile?.accountHolderName || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>Account Number</span>
                <strong>{profile?.accountNumber || "Not provided"}</strong>
              </div>
              <div className="detail-item">
                <span>IFSC Code</span>
                <strong>{profile?.ifscCode || "Not provided"}</strong>
              </div>
            </div>
          </section>

          <section className="owner-panel">
            <header className="owner-panel-header">
              <div>
                <h2>Controls</h2>
                <p>Visibility and order settings.</p>
              </div>
            </header>
            <div className="owner-panel-body detail-stack">
              <div className="detail-item">
                <span>Cafe Visible</span>
                <strong>{profile?.cafeVisible ? "Enabled" : "Hidden"}</strong>
              </div>
              <div className="detail-item">
                <span>Orders Paused</span>
                <strong>{profile?.ordersPaused ? "Yes" : "No"}</strong>
              </div>
              <div className="detail-item">
                <span>Minimum Order</span>
                <strong>{profile?.minOrderValue ?? "Not set"}</strong>
              </div>
              <div className="detail-item">
                <span>Prep Time (mins)</span>
                <strong>{profile?.prepTimeMinutes ?? "Not set"}</strong>
              </div>
            </div>
          </section>

          <section className="owner-panel wide">
            <header className="owner-panel-header">
              <div>
                <h2>Service Features</h2>
                <p>What customers can expect from your cafe.</p>
              </div>
            </header>
            <div className="owner-panel-body service-grid">
              {profile?.workingDays?.length ? (
                <div className="detail-item">
                  <span>Working Days</span>
                  <strong>{profile.workingDays.join(", ")}</strong>
                </div>
              ) : null}
              {serviceModes.map((service) => (
                <div key={service.label} className={`service-chip ${service.value ? "active" : "inactive"}`}>
                  <span>{service.label}</span>
                  <strong>{service.value ? "Enabled" : "Disabled"}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="owner-panel wide" id="menu-section">
            <header className="owner-panel-header">
              <div>
                <h2>Menu Management</h2>
                <p>Create categories, add items, and manage availability.</p>
              </div>
            </header>
            <div className="owner-panel-body menu-management">
              {menuError && <div className="owner-alert">{menuError}</div>}
              {!isApproved ? (
                <div className="owner-state">Menu management is available after approval.</div>
              ) : (
                <>
                  <div className="menu-form">
                    <div className="detail-item">
                      <span>New Category</span>
                      <input
                        type="text"
                        value={newCategory.name}
                        placeholder="Category name"
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="detail-item">
                      <span>Description</span>
                      <input
                        type="text"
                        value={newCategory.description}
                        placeholder="Optional description"
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <button type="button" className="action-btn" onClick={handleAddCategory}>
                      Add Category
                    </button>
                  </div>

                  {menuLoading ? (
                    <div className="owner-state">Loading menu...</div>
                  ) : menuCategories.length === 0 ? (
                    <div className="owner-state">No categories yet.</div>
                  ) : (
                    <div className="menu-list">
                      {menuCategories.map((category) => (
                        <div key={category.id} className="menu-category-card">
                          <div className="menu-category-header">
                            <div>
                              <h3>{category.name}</h3>
                              <p>{category.description || "No description"}</p>
                            </div>
                            <div className="menu-actions">
                              <button type="button" className="ghost-btn" onClick={() => handleEditCategory(category)}>
                                Edit
                              </button>
                              <button type="button" className="ghost-btn danger" onClick={() => handleDeleteCategory(category.id)}>
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="menu-items-list">
                            {category.items.length === 0 && (
                              <div className="owner-state">No items yet.</div>
                            )}
                            {category.items.map((item) => (
                              <div key={item.id} className="menu-item-row">
                                <div>
                                  <strong>{item.name}</strong>
                                  <span>₹{item.price}</span>
                                </div>
                                <div className="menu-item-actions">
                                  <label className="toggle-small">
                                    <input
                                      type="checkbox"
                                      checked={item.available}
                                      onChange={() => handleToggleAvailability(item, category.id)}
                                    />
                                    <span>{item.available ? "Available" : "Unavailable"}</span>
                                  </label>
                                  <button type="button" className="ghost-btn" onClick={() => handleEditItem(item, category.id)}>
                                    Edit
                                  </button>
                                  <button type="button" className="ghost-btn danger" onClick={() => handleDeleteItem(item.id, category.id)}>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="menu-add-item">
                            <input
                              type="text"
                              placeholder="Item name"
                              value={itemDrafts[category.id]?.name || ""}
                              onChange={(e) => updateItemDraft(category.id, "name", e.target.value)}
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={itemDrafts[category.id]?.price || ""}
                              onChange={(e) => updateItemDraft(category.id, "price", e.target.value)}
                            />
                            <label className="toggle-small">
                              <input
                                type="checkbox"
                                checked={itemDrafts[category.id]?.veg ?? true}
                                onChange={(e) => updateItemDraft(category.id, "veg", e.target.checked)}
                              />
                              <span>Veg</span>
                            </label>
                            <button type="button" className="action-btn" onClick={() => handleAddItem(category.id)}>
                              Add Item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="owner-panel wide" id="orders-section">
            <header className="owner-panel-header">
              <div>
                <h2>Orders</h2>
                <p>Today’s order summary will appear here.</p>
              </div>
            </header>
            <div className="owner-panel-body">
              <div className="owner-state">Order management coming next.</div>
            </div>
          </section>

          <section className="owner-panel wide" id="bookings-section">
            <header className="owner-panel-header">
              <div>
                <h2>Table Bookings</h2>
                <p>Upcoming bookings will appear here.</p>
              </div>
            </header>
            <div className="owner-panel-body">
              <div className="owner-state">Booking management coming next.</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
