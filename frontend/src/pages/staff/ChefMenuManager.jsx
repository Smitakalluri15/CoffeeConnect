import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Pencil, RefreshCw, Search } from "lucide-react";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import PremiumModal from "../../components/ui/PremiumModal";
import {
  getStaffMenuCategories,
  updateStaffMenuItem,
  updateStaffMenuItemAvailability
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./StaffDashboard.css";

const CATEGORY_TABS = ["Coffee", "Snacks", "Desserts", "Seasonal", "All"];

export default function ChefMenuManager() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editDraft, setEditDraft] = useState({ name: "", price: "", description: "" });

  const loadMenu = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getStaffMenuCategories(token);
      const normalized = Array.isArray(data)
        ? data.map((c) => ({ ...c, items: c.items || [] }))
        : [];
      setCategories(normalized);
    } catch (err) {
      setError(err?.message || "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allItems = useMemo(
    () =>
      categories.flatMap((category) =>
        (category.items || []).map((item) => ({
          ...item,
          categoryName: category.name
        }))
      ),
    [categories]
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesTab =
        activeTab === "All" ||
        item.categoryName?.toLowerCase().includes(activeTab.toLowerCase());
      const matchesSearch =
        term.length === 0 ||
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [allItems, activeTab, search]);

  const toggleAvailability = async (item) => {
    setActionKey(`avail-${item.id}`);
    try {
      await updateStaffMenuItemAvailability(item.id, !item.available, token);
      await loadMenu();
    } catch (err) {
      setError(err?.message || "Update failed");
    } finally {
      setActionKey("");
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setEditDraft({
      name: item.name || "",
      price: item.price ?? "",
      description: item.description || ""
    });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingItem) return;
    setActionKey(`edit-${editingItem.id}`);
    try {
      await updateStaffMenuItem(
        editingItem.id,
        {
          name: editDraft.name.trim(),
          price: Number(editDraft.price),
          description: editDraft.description.trim() || null,
          imageUrl: editingItem.imageUrl || null,
          veg: Boolean(editingItem.veg),
          available: Boolean(editingItem.available)
        },
        token
      );
      setEditingItem(null);
      await loadMenu();
    } catch (err) {
      setError(err?.message || "Failed to save item");
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="staff-shell">
      <header className="staff-head">
        <div>
          <h1>Menu Management</h1>
          <p>Manage item availability and seasonal specials.</p>
        </div>
        <div className="staff-head-actions">
          <PremiumButton variant="ghost" onClick={() => navigate(-1)}>
            Back
          </PremiumButton>
          <PremiumButton variant="ghost" onClick={loadMenu}>
            <RefreshCw size={14} /> Refresh
          </PremiumButton>
        </div>
      </header>

      {error && <div className="staff-alert">{error}</div>}

      <PremiumCard className="menu-bar" hover={false}>
        <div className="menu-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`chef-category-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="menu-search">
          <Search size={16} />
          <input
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PremiumCard>

      {loading ? (
        <div className="staff-loading">Loading menu...</div>
      ) : filteredItems.length === 0 ? (
        <div className="staff-empty">No items match this filter.</div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <PremiumCard key={item.id} className="menu-card" hover={false}>
              <div className="menu-card-head">
                <div>
                  <strong>{item.name}</strong>
                  <p className="menu-meta">{item.categoryName} • ₹{Number(item.price || 0).toFixed(2)}</p>
                </div>
                <span className={`staff-status menu ${item.available ? "available" : "unavailable"}`}>
                  {item.available ? "Available" : "Out of Stock"}
                </span>
              </div>
              <p className="chef-menu-note">{item.description || "No description"}</p>
              <div className="chef-menu-actions">
                <PremiumButton
                  variant="secondary"
                  disabled={actionKey === `avail-${item.id}`}
                  onClick={() => toggleAvailability(item)}
                >
                  {item.available ? <EyeOff size={14} /> : <Eye size={14} />}
                  {item.available ? "Mark Out of Stock" : "Mark Available"}
                </PremiumButton>
                <PremiumButton variant="ghost" onClick={() => openEdit(item)}>
                  <Pencil size={14} /> Edit Item
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      <PremiumModal
        open={Boolean(editingItem)}
        title="Edit Menu Item"
        subtitle={editingItem ? editingItem.name : ""}
        onClose={() => setEditingItem(null)}
      >
        <form className="premium-form-grid" onSubmit={saveEdit}>
          <div className="premium-field full">
            <label>Item Name</label>
            <input
              value={editDraft.name}
              onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="premium-field">
            <label>Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editDraft.price}
              onChange={(e) => setEditDraft((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <div className="premium-field full">
            <label>Description</label>
            <textarea
              value={editDraft.description}
              onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="premium-modal-actions">
            <PremiumButton type="button" variant="ghost" onClick={() => setEditingItem(null)}>
              Cancel
            </PremiumButton>
            <PremiumButton type="submit" disabled={actionKey === `edit-${editingItem?.id}`}>
              Save Changes
            </PremiumButton>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
