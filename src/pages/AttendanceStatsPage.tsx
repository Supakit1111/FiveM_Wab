import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Search,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type UserStats = {
  user: {
    id: number;
    inGameName: string;
    phoneNumber: string;
    role: string;
    profileImageUrl?: string;
  };
  stats: {
    present: number;
    late: number;
    absent: number;
    leave: number;
    total: number;
  };
};

export default function AttendanceStatsPage() {
  const [data, setData] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  async function loadData() {
    setLoading(true);
    try {
      const result = await apiFetch<UserStats[]>(
        `/attendance/statistics?startDate=${startDate}&endDate=${endDate}`
      );
      setData(result);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = data.filter((item) =>
    item.user.inGameName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStats = filteredData.reduce(
    (acc, item) => ({
      present: acc.present + item.stats.present,
      late: acc.late + item.stats.late,
      absent: acc.absent + item.stats.absent,
      leave: acc.leave + item.stats.leave,
      total: acc.total + item.stats.total,
    }),
    { present: 0, late: 0, absent: 0, leave: 0, total: 0 }
  );

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-100">
            สถิติการเข้าร่วมกิจกรรม
          </h1>
          <p className="mt-1 text-slate-400">
            ภาพรวมการเข้าร่วมกิจกรรมของสมาชิกทั้งหมด
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสมาชิก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-200 outline-none scheme-dark"
              />
            </div>
            <span className="text-slate-500">-</span>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-200 outline-none scheme-dark"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 rounded-xl border border-slate-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-400">ทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">
            {totalStats.total}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-950/40 to-slate-900/40 p-4 rounded-xl border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-300">มา</span>
          </div>
          <p className="text-2xl font-bold text-emerald-200">
            {totalStats.present}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-950/40 to-slate-900/40 p-4 rounded-xl border border-amber-500/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-amber-300">สาย</span>
          </div>
          <p className="text-2xl font-bold text-amber-200">{totalStats.late}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-rose-950/40 to-slate-900/40 p-4 rounded-xl border border-rose-500/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span className="text-sm text-rose-300">ขาด</span>
          </div>
          <p className="text-2xl font-bold text-rose-200">
            {totalStats.absent}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 p-4 rounded-xl border border-blue-500/20"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-blue-300">ลา</span>
          </div>
          <p className="text-2xl font-bold text-blue-200">{totalStats.leave}</p>
        </motion.div>
      </div>

      {/* User Statistics Table */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                  สมาชิก
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-emerald-400">
                  มา
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-amber-400">
                  สาย
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-rose-400">
                  ขาด
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-blue-400">
                  ลา
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">กำลังโหลดข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <motion.tr
                    key={item.user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center border border-slate-700 group-hover:border-teal-500/50 transition-colors">
                          <span className="text-sm font-bold text-white">
                            {item.user.inGameName?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-teal-200 transition-colors">
                            {item.user.inGameName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.user.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg",
                          item.stats.present > 0
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-slate-800/50 text-slate-600"
                        )}
                      >
                        {item.stats.present}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg",
                          item.stats.late > 0
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-slate-800/50 text-slate-600"
                        )}
                      >
                        {item.stats.late}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg",
                          item.stats.absent > 0
                            ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            : "bg-slate-800/50 text-slate-600"
                        )}
                      >
                        {item.stats.absent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg",
                          item.stats.leave > 0
                            ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                            : "bg-slate-800/50 text-slate-600"
                        )}
                      >
                        {item.stats.leave}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {item.stats.total}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
