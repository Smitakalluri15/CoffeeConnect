import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCafeDetails, getCafeMenu, resolveMediaUrl } from "../api/api";
import { addToCart, getCart, getCartCount, updateCartItemQuantity, updateCartTableNumber } from "../utils/cart";
import "./CustomerFlow.css";

const MENU_REFRESH_MS = 5000;

export default function CafeMenuPage() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cafe, setCafe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cartCount, setCartCount] = useState(getCartCount());
  const [itemQuantities, setItemQuantities] = useState({});
  const [failedImages, setFailedImages] = useState({});
  const preselectedTableNumber = (searchParams.get("table") || searchParams.get("tableNumber") || "").trim();

  const syncCartState = () => {
    const cart = getCart();
    const nextCounts = {};
    if (cart && String(cart.cafeId) === String(cafeId) && Array.isArray(cart.items)) {
      for (const cartItem of cart.items) {
        nextCounts[cartItem.itemId] = Number(cartItem.quantity) || 0;
      }
    }
    setItemQuantities(nextCounts);
    setCartCount(getCartCount());
  };

  const currentCart = getCart();
  const activeTableNumber = currentCart && String(currentCart.cafeId) === String(cafeId) && currentCart.tableNumber
    ? currentCart.tableNumber
    : preselectedTableNumber || "";

  useEffect(() => {
    syncCartState();
    window.addEventListener("cart-updated", syncCartState);
    return () => window.removeEventListener("cart-updated", syncCartState);
  }, [cafeId]);

  useEffect(() => {
    if (!preselectedTableNumber) return;
    updateCartTableNumber(preselectedTableNumber, cafeId);
    syncCartState();
  }, [cafeId, preselectedTableNumber]);

  useEffect(() => {
    if (!cafeId) return undefined;
    let active = true;

    const loadInitial = async () => {
      setLoading(true);
      setError("");
      try {
        const [cafeDetails, menu] = await Promise.all([getCafeDetails(cafeId), getCafeMenu(cafeId)]);
        if (!active) return;
        setCafe(cafeDetails);
        setCategories(Array.isArray(menu) ? menu : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load menu.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return undefined;
    let active = true;

    const refreshMenu = async () => {
      try {
        const menu = await getCafeMenu(cafeId);
        if (!active) return;
        setCategories(Array.isArray(menu) ? menu : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load menu.");
      }
    };

    const intervalId = window.setInterval(() => {
      refreshMenu();
    }, MENU_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [cafeId]);

  const itemsCount = useMemo(() => {
    return categories.reduce((sum, category) => sum + ((category.items || []).length), 0);
  }, [categories]);

  const handleAddToCart = (item) => {
    if (!cafe) return;
    addToCart(cafe, item, { tableNumber: activeTableNumber });
    setMessage(`${item.name} added to cart`);
    setTimeout(() => setMessage(""), 2000);
    syncCartState();
  };

  const handleIncrease = (item) => {
    const current = Number(itemQuantities[item.id] || 0);
    if (current <= 0) {
      handleAddToCart(item);
      return;
    }
    updateCartItemQuantity(item.id, current + 1);
    syncCartState();
  };

  const handleDecrease = (itemId) => {
    const current = Number(itemQuantities[itemId] || 0);
    if (current <= 0) return;
    updateCartItemQuantity(itemId, current - 1);
    syncCartState();
  };

  return (
    <div className="customer-page">
      <div className="customer-shell">
        <section className="customer-panel">
          <div className="customer-panel-head">
            <div>
              <h2>{cafe?.cafeName || "Cafe Menu"}</h2>
              <p>{itemsCount} items available across categories.</p>
            </div>
            <div className="flow-chips">
              {activeTableNumber && <span>Table {activeTableNumber}</span>}
              <button className="customer-btn ghost" onClick={() => navigate(`/cafes/${cafeId}`)}>
                Back to Cafe
              </button>
              <button className="customer-btn" onClick={() => navigate("/cart")}>
                Open Cart ({cartCount})
              </button>
            </div>
          </div>

          {message && <div className="customer-state">{message}</div>}
          {error && <div className="customer-state">{error}</div>}
          {loading ? (
            <div className="customer-state">Loading menu...</div>
          ) : categories.length === 0 ? (
            <div className="customer-state">This cafe has no active menu items yet.</div>
          ) : (
            <div className="menu-category-section">
              {categories.map((category) => (
                <section key={category.id} className="customer-panel">
                  <div className="customer-panel-head">
                    <div>
                      <h2>{category.name}</h2>
                      <p>{category.description || "Freshly prepared items"}</p>
                    </div>
                  </div>
                  <div className="menu-items-grid">
                    {(category.items || []).map((item) => (
                      <article key={item.id} className="menu-item-card">
                        <div className="menu-item-media">
                          {resolveMediaUrl(item.imageUrl) && !failedImages[item.id] ? (
                            <img
                              src={resolveMediaUrl(item.imageUrl)}
                              alt={item.name}
                              onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                            />
                          ) : (
                            <div className="cafe-list-fallback">{item.name.slice(0, 1)}</div>
                          )}
                        </div>
                        <div className="menu-item-body">
                          <div className="price-row">
                            <h4>{item.name}</h4>
                            <span>₹{Number(item.price || 0).toFixed(0)}</span>
                          </div>
                          <p>{item.description || "Chef special selection for this cafe."}</p>
                          <div className="flow-chips">
                            <span>{item.veg ? "Veg" : "Non-Veg"}</span>
                            <span>{item.available ? "Available" : "Unavailable"}</span>
                          </div>
                          <div className="menu-action-row">
                            <div className="menu-qty-row">
                              <button
                                className="qty-btn"
                                disabled={!item.available || (itemQuantities[item.id] || 0) <= 0}
                                onClick={() => handleDecrease(item.id)}
                              >
                                -
                              </button>
                              <span className="menu-qty-count">{itemQuantities[item.id] || 0}</span>
                              <button
                                className="qty-btn"
                                disabled={!item.available}
                                onClick={() => handleIncrease(item)}
                              >
                                +
                              </button>
                            </div>
                            {(itemQuantities[item.id] || 0) === 0 ? (
                              <button
                                className="customer-btn"
                                disabled={!item.available}
                                onClick={() => handleAddToCart(item)}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <button className="customer-btn light" onClick={() => navigate("/cart")}>
                                View Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
