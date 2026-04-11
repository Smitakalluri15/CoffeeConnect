const CART_KEY = "coffee_customer_cart_v1";

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

export function getCartCount() {
  const cart = getCart();
  if (!cart?.items?.length) return 0;
  return cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function saveCart(cart) {
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    clearCart();
    return;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateCartTableNumber(tableNumber, cafeId = null) {
  const cart = getCart();
  if (!cart?.items?.length) return null;
  if (cafeId != null && String(cart.cafeId) !== String(cafeId)) return cart;

  const normalizedTableNumber = typeof tableNumber === "string" ? tableNumber.trim() : "";
  const next = {
    ...cart,
    tableNumber: normalizedTableNumber || null
  };
  saveCart(next);
  return next;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(cafe, item, options = {}) {
  const current = getCart();
  const next = buildBaseCart(cafe, current, options.tableNumber);
  const existing = next.items.find((entry) => entry.itemId === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    next.items.push({
      itemId: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      quantity: 1,
      veg: Boolean(item.veg)
    });
  }

  saveCart(next);
  return next;
}

export function updateCartItemQuantity(itemId, quantity) {
  const cart = getCart();
  if (!cart?.items?.length) return null;
  const normalizedQty = Math.max(0, Number(quantity) || 0);
  const items = cart.items
    .map((item) => (item.itemId === itemId ? { ...item, quantity: normalizedQty } : item))
    .filter((item) => item.quantity > 0);
  const next = { ...cart, items };
  saveCart(next);
  return next;
}

export function removeCartItem(itemId) {
  const cart = getCart();
  if (!cart?.items?.length) return null;
  const items = cart.items.filter((item) => item.itemId !== itemId);
  const next = { ...cart, items };
  saveCart(next);
  return next;
}

function buildBaseCart(cafe, currentCart, tableNumber) {
  const normalizedTableNumber = typeof tableNumber === "string" ? tableNumber.trim() : "";
  if (!currentCart || String(currentCart.cafeId) !== String(cafe.id)) {
    return {
      cafeId: cafe.id,
      cafeName: cafe.cafeName,
      tableNumber: normalizedTableNumber || null,
      items: []
    };
  }
  return {
    cafeId: currentCart.cafeId,
    cafeName: currentCart.cafeName || cafe.cafeName,
    tableNumber: normalizedTableNumber || currentCart.tableNumber || null,
    items: Array.isArray(currentCart.items) ? [...currentCart.items] : []
  };
}
