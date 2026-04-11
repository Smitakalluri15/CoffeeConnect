import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import PremiumModal from "../../components/ui/PremiumModal";
import PremiumSkeleton from "../../components/ui/PremiumSkeleton";
import {
  addMenuItem,
  createMenuCategory,
  deleteMenuItem,
  getOwnerMenuCategories,
  resolveMediaUrl,
  updateMenuItem,
  updateMenuItemAvailability,
  uploadMenuItemImage
} from "../../api/api";

const PAGE_SIZE = 10;
const EMPTY_DRAFT = {
  categoryId: "",
  name: "",
  price: "",
  description: "",
  veg: true,
  available: true,
  imageFile: null,
  imageUrl: ""
};

export default function OwnerMenu() {
  const { owner, token } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [page, setPage] = useState(1);

  const isApproved = owner?.status === "ACTIVE";

  const loadMenu = async () => {
    if (!isApproved) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getOwnerMenuCategories(token);
      const list = Array.isArray(data) ? data : [];
      setCategories(list.map((category) => ({ ...category, items: category.items || [] })));
      if (list.length > 0) {
        setActiveCategoryId((previous) => previous ?? list[0].id);
      }
    } catch (err) {
      setError(err?.message || "Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [isApproved, token]);

  useEffect(() => {
    setPage(1);
  }, [activeCategoryId]);

  const activeCategory = useMemo(() => {
    if (!categories.length) return null;
    return categories.find((category) => category.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  const visibleItems = useMemo(() => {
    const all = activeCategory?.items || [];
    const start = (page - 1) * PAGE_SIZE;
    return all.slice(start, start + PAGE_SIZE);
  }, [activeCategory, page]);

  const totalPages = useMemo(() => {
    const count = activeCategory?.items?.length || 0;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [activeCategory]);

  const ensureDefaultCategory = async () => {
    if (categories.length > 0) return categories[0].id;
    const saved = await createMenuCategory({ name: "Menu", description: "Main items" }, token);
    const normalized = { ...saved, items: [] };
    setCategories([normalized]);
    setActiveCategoryId(normalized.id);
    return normalized.id;
  };

  const openAddModal = async () => {
    try {
      setError("");
      const defaultCategoryId = await ensureDefaultCategory();
      setEditingItemId(null);
      setDraft({ ...EMPTY_DRAFT, categoryId: activeCategory?.id || defaultCategoryId });
      setModalOpen(true);
    } catch (err) {
      setError(err?.message || "Failed to prepare item form.");
    }
  };

  const openEditModal = (item) => {
    setEditingItemId(item.id);
    setDraft({
      categoryId: activeCategory?.id || "",
      name: item.name || "",
      price: item.price ?? "",
      description: item.description || "",
      veg: Boolean(item.veg),
      available: Boolean(item.available),
      imageFile: null,
      imageUrl: item.imageUrl || ""
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(EMPTY_DRAFT);
    setEditingItemId(null);
    setSaving(false);
  };

  const handleToggleAvailability = async (item) => {
    try {
      setError("");
      const updated = await updateMenuItemAvailability(item.id, !item.available, token);
      setCategories((prev) => prev.map((category) => (
        category.id === activeCategory?.id
          ? { ...category, items: category.items.map((entry) => (entry.id === item.id ? updated : entry)) }
          : category
      )));
    } catch (err) {
      setError(err?.message || "Failed to update availability.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmed = window.confirm("Delete this menu item?");
    if (!confirmed) return;
    try {
      setError("");
      await deleteMenuItem(itemId, token);
      setCategories((prev) => prev.map((category) => (
        category.id === activeCategory?.id
          ? { ...category, items: category.items.filter((entry) => entry.id !== itemId) }
          : category
      )));
    } catch (err) {
      setError(err?.message || "Failed to delete item.");
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setDraft((prev) => ({ ...prev, imageFile: file, imageUrl: URL.createObjectURL(file) }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!draft.name || !draft.price) {
      setError("Item name and price are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const categoryId = draft.categoryId || activeCategory?.id || await ensureDefaultCategory();
      let imageUrl = draft.imageUrl || null;
      if (draft.imageFile) {
        const upload = await uploadMenuItemImage(draft.imageFile, token);
        imageUrl = upload?.imageUrl || null;
      }

      const payload = {
        name: draft.name.trim(),
        price: Number(draft.price),
        description: draft.description || null,
        imageUrl,
        veg: Boolean(draft.veg),
        available: Boolean(draft.available)
      };

      if (editingItemId) {
        const updated = await updateMenuItem(editingItemId, payload, token);
        setCategories((prev) => prev.map((category) => (
          category.id === categoryId
            ? { ...category, items: category.items.map((entry) => (entry.id === editingItemId ? updated : entry)) }
            : category
        )));
      } else {
        const saved = await addMenuItem(categoryId, payload, token);
        setCategories((prev) => prev.map((category) => (
          category.id === categoryId
            ? { ...category, items: [saved, ...(category.items || [])] }
            : category
        )));
      }

      closeModal();
    } catch (err) {
      setError(err?.message || "Failed to save menu item.");
      setSaving(false);
    }
  };

  return (
    <div className="owner-page">
      <PremiumCard className="panel" hover={false}>
        <div className="panel-header">
          <div>
            <h2>Menu</h2>
            <p>Visual grid layout with image-first menu cards.</p>
          </div>
          <PremiumButton onClick={openAddModal}>
            <Plus size={16} /> Add Item
          </PremiumButton>
        </div>

        {error && <div className="owner-alert">{error}</div>}
        {!isApproved && <div className="owner-state">Menu management unlocks after cafe approval.</div>}

        {isApproved && categories.length > 0 && (
          <div className="pill-row" style={{ marginBottom: 12 }}>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`pill-btn ${activeCategory?.id === category.id ? "active" : ""}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                {category.name} ({category.items?.length || 0})
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="premium-grid">
            <PremiumSkeleton height={120} />
            <PremiumSkeleton height={240} />
          </div>
        ) : (
          <>
            {!activeCategory && isApproved && (
              <div className="owner-empty-inline">No category yet. Click “Add Item” and we’ll create your first category automatically.</div>
            )}

            {activeCategory && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {visibleItems.length === 0 ? (
                    <div className="owner-empty-inline">No items yet in this category.</div>
                  ) : (
                    <div className="owner-menu-card-grid">
                      {visibleItems.map((item) => (
                        <motion.article
                          key={item.id}
                          layout
                          whileHover={{ y: -4 }}
                          className="menu-card"
                        >
                          <div className="menu-card-media">
                            {item.imageUrl ? (
                              <img src={resolveMediaUrl(item.imageUrl)} alt={item.name} />
                            ) : (
                              <div className="menu-thumb-fallback">No image</div>
                            )}
                          </div>
                          <div className="menu-card-body">
                            <div className="menu-card-top">
                              <strong>{item.name}</strong>
                              <span className="menu-price">₹{item.price}</span>
                            </div>
                            <p className="menu-desc">{item.description || "No description"}</p>
                            <div className="menu-item-actions">
                              <PremiumButton
                                type="button"
                                variant="ghost"
                                iconOnly
                                title={item.available ? "Disable item" : "Enable item"}
                                onClick={() => handleToggleAvailability(item)}
                              >
                                {item.available ? <Eye size={15} /> : <EyeOff size={15} />}
                              </PremiumButton>
                              <PremiumButton type="button" variant="secondary" iconOnly onClick={() => openEditModal(item)}>
                                <Pencil size={15} />
                              </PremiumButton>
                              <PremiumButton type="button" variant="danger" iconOnly onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 size={15} />
                              </PremiumButton>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}

        {activeCategory && (activeCategory.items?.length || 0) > PAGE_SIZE && (
          <div className="menu-pagination">
            <PremiumButton variant="ghost" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Prev</PremiumButton>
            <span>Page {page} of {totalPages}</span>
            <PremiumButton variant="ghost" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</PremiumButton>
            <span className="menu-count">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, activeCategory.items.length)} of {activeCategory.items.length}
            </span>
          </div>
        )}
      </PremiumCard>

      <PremiumModal
        open={modalOpen}
        title={editingItemId ? "Edit Menu Item" : "Add Menu Item"}
        subtitle="Image, price, description and item details"
        onClose={closeModal}
      >
        <form className="premium-form-grid" onSubmit={handleSave}>
          <div className="premium-field">
            <label>Category</label>
            <select
              value={draft.categoryId}
              onChange={(event) => setDraft((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="premium-field">
            <label>Item Name</label>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="premium-field">
            <label>Price</label>
            <input
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
          </div>
          <div className="premium-field">
            <label>Veg / Non-veg</label>
            <select
              value={draft.veg ? "VEG" : "NON_VEG"}
              onChange={(event) => setDraft((prev) => ({ ...prev, veg: event.target.value === "VEG" }))}
            >
              <option value="VEG">Veg</option>
              <option value="NON_VEG">Non-veg</option>
            </select>
          </div>

          <div className="premium-field full">
            <label>Description</label>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          <div className="premium-field full">
            <label>Item Image</label>
            <input type="file" accept="image/*" onChange={(event) => handleFileChange(event.target.files?.[0])} />
            {draft.imageUrl ? (
              <motion.img
                key={draft.imageUrl}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="owner-image-preview"
                src={resolveMediaUrl(draft.imageUrl)}
                alt="Item preview"
              />
            ) : (
              <div className="owner-empty-inline"><ImagePlus size={16} style={{ verticalAlign: "middle" }} /> No image selected</div>
            )}
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={draft.available}
              onChange={(event) => setDraft((prev) => ({ ...prev, available: event.target.checked }))}
            />
            Mark item available immediately
          </label>

          <div className="full" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <PremiumButton type="button" variant="ghost" onClick={closeModal}>Cancel</PremiumButton>
            <PremiumButton type="submit" disabled={saving}>
              {saving ? "Saving..." : editingItemId ? "Update Item" : "Add Item"}
            </PremiumButton>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
