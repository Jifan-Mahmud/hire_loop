"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "@/lib/auth-client";

const LiveUserContext = createContext({
  user: null,
  role: "seeker",
  status: "active",
  isBanned: false,
  isPending: true,
  refresh: () => {},
});

export function LiveUserProvider({ children }) {
  const { data: session, isPending: isSessionPending } = useSession();
  const sessionUser = session?.user;

  const [liveUser, setLiveUser] = useState(null);

  const syncUser = useCallback(async () => {
    if (!sessionUser) return;
    try {
      const res = await fetch("/api/user/sync", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setLiveUser(data.user);
        }
      }
    } catch (err) {
      console.error("Live user sync error:", err);
    }
  }, [sessionUser]);

  useEffect(() => {
    let active = true;

    async function initialSync() {
      if (!sessionUser) return;
      try {
        const res = await fetch("/api/user/sync", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (active && data?.user) {
            setLiveUser(data.user);
          }
        }
      } catch (err) {
        console.error("Live user sync error:", err);
      }
    }

    initialSync();

    // Re-sync on window focus (switching tabs or windows)
    const handleFocus = () => {
      initialSync();
    };
    window.addEventListener("focus", handleFocus);

    // Periodic check (every 4 seconds) to detect role / ban changes in real-time
    const interval = setInterval(initialSync, 4000);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [sessionUser]);

  const effectiveUser = useMemo(
    () => (liveUser ? { ...sessionUser, ...liveUser } : sessionUser),
    [sessionUser, liveUser]
  );

  const role = effectiveUser?.role || "seeker";
  const status = effectiveUser?.status || "active";
  const isBanned = status === "banned" || status === "suspended";
  const isPending = isSessionPending;

  const contextValue = useMemo(
    () => ({
      user: effectiveUser,
      role,
      status,
      isBanned,
      isPending,
      refresh: syncUser,
    }),
    [effectiveUser, role, status, isBanned, isPending, syncUser]
  );

  return (
    <LiveUserContext.Provider value={contextValue}>
      {children}
    </LiveUserContext.Provider>
  );
}

export function useLiveUser() {
  return useContext(LiveUserContext);
}
