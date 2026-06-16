"use client";

export const TOKEN_KEY = "coupontrust_token";
export const USER_KEY = "coupontrust_user";
export const AUTH_EVENT = "couponx-auth-changed";

const getAuthStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage;
};

const readLegacyValue = (key) => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
};

const removeLegacySession = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

const readAuthValue = (key) => {
  const storage = getAuthStorage();
  if (!storage) {
    return null;
  }

  const currentValue = storage.getItem(key);
  if (currentValue) {
    return currentValue;
  }

  const legacyValue = readLegacyValue(key);
  if (legacyValue) {
    storage.setItem(key, legacyValue);
    removeLegacySession();
    return legacyValue;
  }

  return null;
};

export const saveSession = ({ token, user }) => {
  const storage = getAuthStorage();
  if (!storage) {
    return;
  }
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  removeLegacySession();
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearSession = () => {
  const storage = getAuthStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
  removeLegacySession();
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = readAuthValue(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () =>
  typeof window !== "undefined" ? readAuthValue(TOKEN_KEY) : null;

export const isAuthenticated = () =>
  typeof window !== "undefined" && Boolean(readAuthValue(TOKEN_KEY));

export const isTrustLockedUser = (user) => {
  if (!user || user.role === "super_admin") {
    return false;
  }
  return Number(user.trustScore ?? 100) < 40;
};
