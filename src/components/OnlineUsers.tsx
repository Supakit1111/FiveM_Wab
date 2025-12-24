import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

type ActiveUser = {
  id: string;
  name: string;
  role: string;
};

export function OnlineUsers({ className }: { className?: string }) {
  const currentUser = getUser();

  // Decide what ID to use. If logged in, use real ID. If not, generate a random "Visitor" ID.
  const [visitorId] = useState(
    () => `visitor-${Math.floor(Math.random() * 10000)}`
  );

  const myId = currentUser ? String(currentUser.id) : visitorId;
  const myName = currentUser ? currentUser.inGameName : "Visitor";
  const myRole = currentUser ? currentUser.role : "GUEST";

  // Initialize with "Me" so it's never empty (Instant feedback)
  const [users, setUsers] = useState<ActiveUser[]>([
    { id: myId, name: myName, role: myRole },
  ]);

  async function sendHeartbeat() {
    try {
      const activeList = await apiFetch<ActiveUser[]>("/presence/heartbeat", {
        method: "POST",
        body: JSON.stringify({
          id: myId,
          name: myName,
          role: myRole,
        }),
      });

      // Merge list to ensure 'Me' stays if heartbeat is slow, but usually API returns 'Me' too.
      // API source of truth is better.
      if (activeList && Array.isArray(activeList)) {
        setUsers(activeList);
      }
    } catch (e) {
      console.error("Heartbeat failed", e);
      // In case of error (e.g. 404), keep showing "Me" so UI doesn't disappear
      setUsers((prev) => {
        if (prev.find((u) => u.id === myId)) return prev;
        return [...prev, { id: myId, name: myName, role: myRole }];
      });
    }
  }

  useEffect(() => {
    // Initial call
    void sendHeartbeat();

    // Loop every 5 seconds
    const interval = setInterval(() => {
      void sendHeartbeat();
    }, 5000);

    return () => clearInterval(interval);
  }, [myId, myName, myRole]);

  // Max avatars to show before "+N" (User requested to show everyone, set to high number)
  const MAX_SHOW = 20;
  const displayUsers = users.slice(0, MAX_SHOW);
  const remainder = Math.max(0, users.length - MAX_SHOW);

  return (
    <div
      className={`flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 p-1.5 pl-4 backdrop-blur-md shadow-xl shadow-black/20 ${className}`}
    >
      {/* Live Indicator */}
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-emerald-400">
          LIVE
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px bg-white/10" />

      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence mode="popLayout">
          {displayUsers.map((u) => (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative group"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 text-[10px] font-bold text-white shadow-sm transition-transform hover:z-10 hover:scale-110 ${
                  u.role === "ADMIN"
                    ? "bg-gradient-to-br from-rose-500 to-red-600"
                    : u.id.startsWith("visitor")
                    ? "bg-slate-700"
                    : "bg-gradient-to-br from-teal-500 to-emerald-600"
                }`}
                title={u.name}
              >
                {u.name.charAt(0).toUpperCase()}
              </div>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[10px] text-white shadow-lg border border-white/10">
                  {u.name}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {remainder > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-[10px] font-medium text-slate-300 hover:bg-slate-700"
          >
            +{remainder}
          </motion.div>
        )}
      </div>
    </div>
  );
}
