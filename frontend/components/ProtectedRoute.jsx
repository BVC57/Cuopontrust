"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";
import { clearSession, getStoredToken, saveSession } from "../lib/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const token = getStoredToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        saveSession({ token, user: data.user });
        setReady(true);
      } catch {
        clearSession();
        window.location.href = "/login";
      }
    };

    verifySession();
  }, []);

  if (!ready) {
    return <LoadingSpinner label="Checking session..." />;
  }

  return children;
}
