"use client";

export const TOKEN_KEY = "coupontrust_token";
export const USER_KEY = "coupontrust_user";
export const AUTH_EVENT = "couponx-auth-changed";

export const saveSession = ({ token, user }) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const isAuthenticated = () =>
  typeof window !== "undefined" && Boolean(localStorage.getItem(TOKEN_KEY));
