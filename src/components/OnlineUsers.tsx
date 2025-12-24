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
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex -space-x-3 rtl:space-x-reverse">
        <AnimatePresence mode="popLayout">
          {displayUsers.map((u) => (
            <motion.div
              key={u.id}
              layout
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative group"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 text-xs font-bold text-white shadow-sm transition-transform hover:z-10 hover:scale-110 ${
                  u.role === "ADMIN"
                    ? "bg-gradient-to-br from-rose-500 to-red-600"
                    : u.id.startsWith("visitor")
                    ? "bg-slate-700"
                    : "bg-gradient-to-br from-teal-500 to-emerald-600"
                }`}
                title={u.name}
              >
                {u.name.charAt(0).toUpperCase()}

                {/* Online Dot */}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-slate-950" />
              </div>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-20">
                {u.name}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {remainder > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            +{remainder}
          </motion.div>
        )}
      </div>

      {/* Label (Optional) */}
      {/* <span className="ml-2 text-xs text-slate-500 hidden md:block">
            Online
        </span> */}
    </div>
  );
}
