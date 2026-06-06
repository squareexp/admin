"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/admin-types";

export function useAdminAuth() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const flagUnauthorized = useCallback(() => {
    setIsUnauthorized(true);
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((data: UserProfile) => {
        setCurrentUser(data);
      })
      .catch((err) => {
        console.log("Auth check failed:", err);
        const returnTo = typeof window !== "undefined"
          ? encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          : encodeURIComponent("/");
        router.push(`/api/auth/start?return_to=${returnTo}`);
      });
  }, [router]);

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

      fetch("/api/logout", { method: "POST" })
      .catch(() => undefined)
      .finally(() => {
        const returnTo = typeof window !== "undefined"
          ? encodeURIComponent(`${window.location.pathname}${window.location.search}`)
          : encodeURIComponent("/");
        router.replace(`/api/auth/start?return_to=${returnTo}`);
      });
  }, [isUnauthorized, router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.refresh();
      const returnTo = typeof window !== "undefined"
        ? encodeURIComponent(`${window.location.pathname}${window.location.search}`)
        : encodeURIComponent("/");
      router.push(`/api/auth/start?return_to=${returnTo}`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  return {
    currentUser,
    isUnauthorized,
    flagUnauthorized,
    handleLogout,
  };
}
