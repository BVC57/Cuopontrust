"use client";

export const TOKEN_KEY = "coupontrust_token";
export const USER_KEY = "coupontrust_user";

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const isAuthenticated = () =>
  typeof window !== "undefined" && Boolean(localStorage.getItem(TOKEN_KEY));
