"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { clearSession, getStoredToken, getStoredUser, saveSession } from "../lib/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const token = getStoredToken();
      if (!token) {
        clearSession();
        router.replace("/login");
        return;
      }

      const storedUser = getStoredUser();
      if (storedUser && active) {
        setReady(true);
      }

      try {
        const { data } = await api.get("/auth/me");
        if (!active) {
          return;
        }
        saveSession({ token, user: data.user });
        setReady(true);
      } catch {
        if (!active) {
          return;
        }
        clearSession();
        router.replace("/login");
      }
    };

    verifySession();
    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return <LoadingSpinner label="Checking session..." />;
  }

  return children;
}
