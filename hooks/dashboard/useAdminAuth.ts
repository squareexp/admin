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
        router.push("/session/access");
      });
  }, [router]);

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

    fetch("/api/logout", { method: "POST" })
      .catch(() => undefined)
      .finally(() => {
        router.replace("/session/access");
      });
  }, [isUnauthorized, router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.refresh();
      router.push("/session/access");
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
