import { ROLES } from "./constants";

export const normalizeRole = (role) => {
  if (!role) return "";
  const normalized = String(role).toUpperCase();
  return normalized.replace(/^ROLE_/, "");
};

export const isAuthorized = (user, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const role = normalizeRole(user?.role);
  return allowedRoles.includes(role);
};

export const isAdmin = (user) => normalizeRole(user?.role) === ROLES.ADMIN;
