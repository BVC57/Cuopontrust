"use client";

import { usePathname } from "next/navigation";

export default function useCurrentPath() {
  return usePathname() || "/";
}
