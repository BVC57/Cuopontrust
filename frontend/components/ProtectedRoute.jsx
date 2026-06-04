"use client";

import { useEffect, useState } from "react";
import { isAuthenticated } from "../lib/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <LoadingSpinner label="Checking session..." />;
  }

  return children;
}
