"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredToken, getStoredUser } from "../lib/auth";
import LoadingSpinner from "./LoadingSpinner";

export default function AdminRoute({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const token = getStoredToken();
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "super_admin") {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return <LoadingSpinner label="Checking admin access..." />;
  }

  return children;
}
