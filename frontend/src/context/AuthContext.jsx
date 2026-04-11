import { createContext, useContext, useEffect, useState } from "react";
import { getAuthMe, loginUser } from "../api/api";

const AuthContext = createContext();

const decodeJwt = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(padded));
    const rawRole = payload.role
      || (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles)
      || (Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities)
      || payload.auth;
    const role = typeof rawRole === "string" ? rawRole.replace(/^ROLE_/, "") : null;
    return {
      email: payload.sub || payload.email || payload.username || null,
      role
    };
  } catch (error) {
    return null;
  }
};

const resolveUserFromToken = async (token, fallbackEmail) => {
  const decoded = decodeJwt(token);
  const email = decoded?.email || fallbackEmail || null;
  if (decoded?.role && email) {
    return { email, role: decoded.role };
  }

  try {
    const resolved = await getAuthMe(token);
    if (resolved?.email && resolved?.role) {
      return {
        email: resolved.email,
        role: resolved.role
      };
    }
  } catch (error) {
    return null;
  }
  return null;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    resolveUserFromToken(token).then((resolved) => {
      if (!active) return;
      if (resolved?.email) {
        setUser(resolved);
      } else {
        localStorage.removeItem("token");
        setToken(null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const jwt = response?.token;
    const userData = response?.user;

    if (!jwt) {
      throw new Error("Login failed: missing token");
    }

    localStorage.setItem("token", jwt);
    setToken(jwt);

    if (userData?.email && userData?.role) {
      setUser(userData);
      return userData;
    }

    const resolved = await resolveUserFromToken(jwt, email);
    if (resolved?.email) {
      setUser(resolved);
      return resolved;
    }

    throw new Error("Login failed: missing user email");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
