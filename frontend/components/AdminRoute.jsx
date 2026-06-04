"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "../lib/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function AdminRoute({ children }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role !== "super_admin") {
      window.location.href = "/";
      return;
    }
    setAllowed(true);
  }, []);

  if (!allowed) {
    return <LoadingSpinner label="Checking admin access..." />;
  }

  return children;
}
