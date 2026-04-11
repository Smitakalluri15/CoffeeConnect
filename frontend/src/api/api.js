export const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8081/api";
const API_ROOT = BASE_URL.replace(/\/api\/?$/, "");

export function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  const normalized = value.replace(/\\/g, "/");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) return normalized;
  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) return normalized;
  if (normalized.startsWith("/")) return `${API_ROOT}${normalized}`;
  return `${API_ROOT}/${normalized}`;
}

async function parseResponse(res) {
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }
  if (!res.ok) {
    if (data && typeof data === "object" && data.error) {
      if (Array.isArray(data.details) && data.details.length > 0) {
        throw new Error(`${data.error}: ${data.details.join(", ")}`);
      }
      throw new Error(data.error);
    }
    throw new Error(typeof data === "string" && data ? data : `Request failed (${res.status})`);
  }
  return data;
}

function authHeaders(token) {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const payload = await parseResponse(res);
  if (typeof payload === "string") {
    return { token: payload, user: null };
  }
  return payload;
}

export async function getAuthMe(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse(res);
}

export async function registerCafeOwner(payload) {
  const res = await fetch(`${BASE_URL}/cafe-owners/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getAdminStats(token) {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getPublicCafes() {
  const res = await fetch(`${BASE_URL}/cafes`);
  return parseResponse(res);
}

export async function getNearbyCafes(latitude, longitude, options = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude)
  });
  if (options.radiusKm) {
    params.set("radiusKm", String(options.radiusKm));
  }
  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  const res = await fetch(`${BASE_URL}/cafes/nearby?${params.toString()}`);
  return parseResponse(res);
}

export async function getCafeDetails(cafeId) {
  const res = await fetch(`${BASE_URL}/cafes/${cafeId}`);
  return parseResponse(res);
}

export async function getCafeMenu(cafeId) {
  const res = await fetch(`${BASE_URL}/cafes/${cafeId}/menu`);
  return parseResponse(res);
}

export async function createBooking(payload, token) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function createOrder(payload, token) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function createRazorpayOrder(payload, token) {
  const res = await fetch(`${BASE_URL}/payments/razorpay/order`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function createRazorpayQrCode(payload, token) {
  const res = await fetch(`${BASE_URL}/payments/razorpay/qr`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getRazorpayQrPaymentStatus(qrCodeId, token) {
  const res = await fetch(`${BASE_URL}/payments/razorpay/qr/${qrCodeId}`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function createDummyPaymentOrder(payload, token) {
  const res = await fetch(`${BASE_URL}/payments/dummy/order`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getMyOrders(token) {
  const res = await fetch(`${BASE_URL}/orders/my`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getMyOrder(orderId, token) {
  const res = await fetch(`${BASE_URL}/orders/my/${orderId}`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getMyBookings(token) {
  const res = await fetch(`${BASE_URL}/bookings/my`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getOwnerBookings(token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/bookings`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function updateOwnerBookingStatus(id, status, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/bookings/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}

export async function getPendingUsers(token) {
  const res = await fetch(`${BASE_URL}/admin/pending-users`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getPendingCafeOwners(token) {
  const res = await fetch(`${BASE_URL}/admin/cafe-owners/pending`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getCafeOwnerById(id, token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/${id}`, {
    headers: token ? authHeaders(token) : undefined
  });
  return parseResponse(res);
}

export async function getUserProfile(id, token) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}/profile`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function approveUser(id, token) {
  const res = await fetch(`${BASE_URL}/admin/approve/${id}`, {
    method: "PUT",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function rejectUser(id, token) {
  const res = await fetch(`${BASE_URL}/admin/reject/${id}`, {
    method: "PUT",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function approveCafeOwner(id, token) {
  const res = await fetch(`${BASE_URL}/admin/cafe-owners/${id}/approve`, {
    method: "PUT",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function rejectCafeOwner(id, reason, token) {
  const res = await fetch(`${BASE_URL}/admin/cafe-owners/${id}/reject`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });
  return parseResponse(res);
}

export async function getUsersActivity(token) {
  const res = await fetch(`${BASE_URL}/admin/users-activity`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}


export async function getMyProfile(token) {
  const res = await fetch(`${BASE_URL}/profile/me`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function updateMyProfile(payload, token) {
  const res = await fetch(`${BASE_URL}/profile/me`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getCafeOwnerMe(token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/me`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function updateCafeVisibility(visible, token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/me/visibility`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ cafeVisible: visible })
  });
  return parseResponse(res);
}

export async function updateCafeProfile(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/me`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function uploadCafeBrandingImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/cafe-owners/me/upload-branding`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData
  });
  return parseResponse(res);
}

export async function uploadCafeBrandingImageForSignup(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/cafe-owners/upload-branding`, {
    method: "POST",
    body: formData
  });
  return parseResponse(res);
}

export async function updateCafeCompliance(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/me/compliance`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateCafeSettings(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owners/me/settings`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getOwnerMenuCategories(token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function createMenuCategory(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateMenuCategory(id, payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateMenuCategoryStatus(id, active, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ active })
  });
  return parseResponse(res);
}

export async function deleteMenuCategory(id, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function addMenuItem(categoryId, payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/categories/${categoryId}/items`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function uploadMenuItemImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/items/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData
  });
  return parseResponse(res);
}

export async function updateMenuItem(itemId, payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/items/${itemId}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateMenuItemAvailability(itemId, available, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/items/${itemId}/availability`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ available })
  });
  return parseResponse(res);
}

export async function deleteMenuItem(itemId, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/menu/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function uploadStaffPhoto(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/upload-photo`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData
  });
  return parseResponse(res);
}

export async function createChef(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/chefs`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function createWaiter(payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/waiters`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function getOwnerStaff(token, role) {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  const res = await fetch(`${BASE_URL}/cafe-owner/staff${query}`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function updateOwnerStaff(staffId, payload, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/${staffId}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateOwnerStaffStatus(staffId, status, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/${staffId}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}

export async function deleteOwnerStaff(staffId, token) {
  const res = await fetch(`${BASE_URL}/cafe-owner/staff/${staffId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getStaffMe(token) {
  const res = await fetch(`${BASE_URL}/staff/me`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getStaffDashboard(token) {
  const res = await fetch(`${BASE_URL}/staff/dashboard`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function getStaffMenuCategories(token) {
  const res = await fetch(`${BASE_URL}/staff/menu/categories`, {
    headers: authHeaders(token)
  });
  return parseResponse(res);
}

export async function createStaffMenuCategory(payload, token) {
  const res = await fetch(`${BASE_URL}/staff/menu/categories`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function addStaffMenuItem(categoryId, payload, token) {
  const res = await fetch(`${BASE_URL}/staff/menu/categories/${categoryId}/items`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateStaffMenuItem(itemId, payload, token) {
  const res = await fetch(`${BASE_URL}/staff/menu/items/${itemId}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}

export async function updateStaffMenuItemAvailability(itemId, available, token) {
  const res = await fetch(`${BASE_URL}/staff/menu/items/${itemId}/availability`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ available })
  });
  return parseResponse(res);
}

export async function updateStaffKitchenStatus(orderId, status, token) {
  const res = await fetch(`${BASE_URL}/staff/orders/${orderId}/kitchen-status`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return parseResponse(res);
}

export async function updateStaffOrderService(orderId, action, token) {
  const res = await fetch(`${BASE_URL}/staff/orders/${orderId}/service`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ action })
  });
  return parseResponse(res);
}

export async function updateStaffBooking(bookingId, payload, token) {
  const res = await fetch(`${BASE_URL}/staff/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(res);
}


export async function requestPasswordReset(email) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return parseResponse(res);
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });
  return parseResponse(res);
}
