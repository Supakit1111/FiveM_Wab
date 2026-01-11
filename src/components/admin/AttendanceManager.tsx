import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Circle,
  ChevronDown,
  Trash2,
  Calendar,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAlert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type User = {
  id: number;
  inGameName: string;
  phoneNumber: string;
  role: string;
  sessions?: Record<
    number,
    { status: "O" | "L" | "A" | "-" | null; checkInTime: string | null }
  >;
};

type RoundConfig = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

// Types for our status
type StatusType = "O" | "L" | "A" | "-" | null;

const STATUS_OPTIONS: {
  value: StatusType;
  label: string;
  color: string;
  icon: any;
}[] = [
  {
    value: "O",
    label: "มา",
    color: "text-emerald-400",
    icon: CheckCircle,
  },
  { value: "L", label: "สาย", color: "text-amber-400", icon: Clock },
  { value: "A", label: "ขาด", color: "text-rose-400", icon: XCircle },
  { value: "-", label: "ล้าง", color: "text-slate-400", icon: Trash2 },
];

export function AttendanceManager() {
  const { showError } = useAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundsConfig, setRoundsConfig] = useState<RoundConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await apiFetch<{
        users: User[];
        roundsConfig: RoundConfig[];
      }>(`/dashboard/checkin-status?limit=1000&date=${selectedDate}`);

      setUsers(data.users || []);
      if (data.roundsConfig && data.roundsConfig.length > 0) {
        setRoundsConfig(data.roundsConfig);
      } else {
        // Default rounds if none configured
        setRoundsConfig([
          { id: 1, name: "Round 1", startTime: "00:00", endTime: "00:00" },
          { id: 2, name: "Round 2", startTime: "00:00", endTime: "00:00" },
          { id: 3, name: "Round 3", startTime: "00:00", endTime: "00:00" },
        ]);
      }
    } catch (e) {
      console.error(e);
      showError("Error", "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (
    userId: number,
    roundId: number,
    nextStatus: StatusType
  ) => {
    try {
      await apiFetch("/attendance/admin-checkin", {
        method: "POST",
        body: JSON.stringify({
          userId,
          session: roundId,
          status: nextStatus,
          date: selectedDate,
        }),
      });

      // Reload data to show the updated state
      await loadData();
    } catch (e) {
      showError("Error", "Failed to update attendance");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="relative w-full md:w-56">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roundsConfig.map((round) => (
            <div
              key={round.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <span className="text-xs font-medium text-slate-300">
                {round.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {round.startTime}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="px-6 py-5 text-slate-400 font-medium">
                  User Information
                </th>
                {roundsConfig.map((r) => (
                  <th
                    key={r.id}
                    className="px-6 py-5 text-center text-slate-400 font-medium whitespace-nowrap"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-200">{r.name}</span>
                      <span className="text-[10px] font-normal opacity-60 font-mono">
                        {r.startTime}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td
                    colSpan={roundsConfig.length + 1}
                    className="p-8 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={roundsConfig.length + 1}
                    className="p-8 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-700">
                          {user.inGameName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {user.inGameName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {user.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    {roundsConfig.map((r) => (
                      <td key={r.id} className="px-6 py-4 text-center">
                        <StatusSelector
                          currentStatus={user.sessions?.[r.id]?.status || null}
                          onChange={(status) =>
                            handleStatusChange(user.id, r.id, status)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusSelector({
  currentStatus,
  onChange,
}: {
  currentStatus: StatusType;
  onChange: (s: StatusType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Find info
  const currentOption =
    STATUS_OPTIONS.find((o) => o.value === currentStatus) ||
    STATUS_OPTIONS.find((o) => o.value === null); // Fallback to 'Clear' look if null? Or just Circle.

  // If null or '-', use neutral
  const isSet = currentStatus && currentStatus !== "-";
  const Icon = isSet ? currentOption?.icon || Circle : Circle;
  const color = isSet
    ? currentOption?.color || "text-slate-500"
    : "text-slate-600";
  const bg = isSet
    ? currentOption?.color.replace("text-", "bg-") + "/10"
    : "bg-slate-800/50";
  const border = isSet
    ? currentOption?.color.replace("text-", "border-") + "/20"
    : "border-slate-700/50";

  return (
    <div className="relative flex justify-center">
      {/* Overlay to close */}
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative z-0 flex items-center justify-center gap-2 w-32 px-3 py-1.5 rounded-lg border transition-all duration-200",
          bg,
          border,
          !isSet && "hover:border-slate-600 hover:bg-slate-800"
        )}
      >
        <Icon className={cn("w-4 h-4", color)} />
        <span className={cn("text-xs font-medium", color)}>
          {isSet ? currentOption?.label : "เลือก"}
        </span>
        <ChevronDown className={cn("w-3 h-3 opacity-50 ml-auto", color)} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-36 p-1.5 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-xl shadow-2xl flex flex-col gap-1"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-slate-800 w-full text-left",
                  currentStatus === opt.value
                    ? "bg-slate-800 text-slate-200"
                    : "text-slate-400"
                )}
              >
                <opt.icon className={cn("w-4 h-4", opt.color)} />
                <span className={opt.color.replace("text-", "text-slate-")}>
                  {opt.label}
                </span>{" "}
                {/* Reset color text for better contrast? Or keep colored. Let's keep colored icon, white text */}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
