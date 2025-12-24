import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  History,
  TrendingUp,
  List,
  LogIn,
  Package,
  CheckCircle,
  Users,
  Megaphone,
  ChevronDown,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";

type LogRow = {
  id: number;
  performerId: number;
  performerName: string | null;
  performerRole: "ADMIN" | "USER" | null;
  actionType: string;
  details: string;
  timestamp: string;
};

function formatDateTime(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("th-TH");
}

export default function LogsPage() {
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  const [data, setData] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination states
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const title = useMemo(
    () => (isAdmin ? "Master Activity Log" : "ประวัติการใช้งานของคุณ"),
    [isAdmin]
  );
  const subtitle = useMemo(
    () => (isAdmin ? "ใครทำอะไร เมื่อไหร่" : "เฉพาะกิจกรรมของคุณ"),
    [isAdmin]
  );

  // Filter options
  const filterOptions = [
    { value: "all", label: "ทั้งหมด", icon: List },
    { value: "login", label: "เข้าสู่ระบบ", icon: LogIn },
    { value: "item", label: "เบิก/ฝาก ของ", icon: Package },
    { value: "attendance", label: "เช็คชื่อ", icon: CheckCircle },
    { value: "admin", label: "การจัดการผู้ใช้", icon: Users },
    { value: "announcement", label: "จัดการประกาศ", icon: Megaphone },
    { value: "money", label: "การเงิน", icon: TrendingUp },
  ];

  // Page size options
  const pageSizeOptions = [5, 10, 15];

  async function loadLogs(
    page: number = 1,
    filter: string = "all",
    size: number = 10
  ) {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * size;
      let url = `/logs?take=${size}&skip=${skip}`;

      // Add filter based on selected type
      if (filter !== "all") {
        if (filter === "login") {
          url += "&actionTypes=USER_LOGIN";
        } else if (filter === "item") {
          url += "&actionTypes=USER_WITHDRAW,ADMIN_DEPOSIT";
        } else if (filter === "attendance") {
          url += "&actionTypes=USER_CHECKIN";
        } else if (filter === "admin") {
          url +=
            "&actionTypes=ADMIN_CREATE_USER,ADMIN_UPDATE_USER,ADMIN_UPDATE_USER_ROLE,ADMIN_RESET_PASSWORD,ADMIN_DELETE_USER";
        } else if (filter === "announcement") {
          url +=
            "&actionTypes=ADMIN_CREATE_ANNOUNCEMENT,ADMIN_UPDATE_ANNOUNCEMENT,ADMIN_DELETE_ANNOUNCEMENT";
        } else if (filter === "money") {
          url += "&actionTypes=ADMIN_WEEKLY_PAYMENT";
        }
      }

      const res = await apiFetch<{
        data: LogRow[];
        page: { take: number; skip: number; hasMore: boolean };
      }>(url);

      setData(res.data);

      // Estimate total records (this is an approximation)
      const estimatedTotal =
        res.page.skip + res.data.length + (res.page.hasMore ? size : 0);
      setTotalRecords(estimatedTotal);
      setTotalPages(Math.ceil(estimatedTotal / size));
    } catch (e) {
      setError((e as any)?.message ?? "โหลด log ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs(currentPage, selectedFilter, pageSize);
  }, [currentPage, selectedFilter, pageSize]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">บันทึกและรายงาน</h1>
        <p className="mt-1 text-slate-400">Logging & Reporting</p>
      </div>

      <SectionHeader icon={History} title={title} subtitle={subtitle} />

      {/* Filter and Pagination Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">ประเภท:</label>
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 pr-10 text-sm text-slate-200 outline-none focus:border-teal-500/60 appearance-none"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {/* Filter icon */}
              <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                {(() => {
                  const selectedOption = filterOptions.find(
                    (opt) => opt.value === selectedFilter
                  );
                  const IconComponent = selectedOption?.icon;
                  return IconComponent ? (
                    <IconComponent className="h-4 w-4 text-slate-400" />
                  ) : null;
                })()}
              </div>
              {/* Dropdown arrow */}
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Page Size Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">แสดง:</label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 pr-8 text-sm text-slate-200 outline-none focus:border-teal-500/60 appearance-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} รายการ
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadLogs(currentPage, selectedFilter, pageSize)}
            className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            รีเฟรช
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>
            หน้า {currentPage} จาก {totalPages || 1}
          </span>
          <span>•</span>
          <span>{totalRecords} รายการทั้งหมด</span>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-400">
          กำลังโหลด...
        </div>
      ) : null}

      {!loading && data.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          ยังไม่มีข้อมูล
        </div>
      ) : null}

      {!loading && data.length > 0 ? (
        <>
          <DataTable
            columns={[
              {
                header: "Action",
                accessor: (row) => (
                  <Badge
                    variant="outline"
                    className="border-slate-600/30 bg-slate-900/30 text-slate-200"
                  >
                    {row.actionType}
                  </Badge>
                ),
                className: "min-w-[200px]",
              },
              {
                header: "ผู้กระทำ",
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">
                      {row.performerName ?? row.performerId}
                    </span>
                    {row.performerRole ? (
                      <Badge
                        variant="outline"
                        className={
                          row.performerRole === "ADMIN"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                            : "border-slate-600/30 bg-slate-900/30 text-slate-200"
                        }
                      >
                        {row.performerRole}
                      </Badge>
                    ) : null}
                  </div>
                ),
                className: "min-w-[200px]",
              },
              {
                header: "รายละเอียด",
                accessor: "details",
                className: "min-w-[360px] text-slate-200",
              },
              {
                header: "เวลา",
                accessor: (row) => formatDateTime(row.timestamp),
                className: "min-w-[180px] text-slate-300",
              },
            ]}
            data={data}
            rowKey={(r) => r.id}
          />

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              แสดง {(currentPage - 1) * pageSize + 1} ถึง{" "}
              {(currentPage - 1) * pageSize + data.length} จาก {totalRecords}{" "}
              รายการ
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← ก่อนหน้า
              </button>

              {/* Page Numbers - Only show if more than 1 page */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-teal-500/20 text-teal-200 border border-teal-500/40"
                            : "border border-slate-700/40 bg-slate-900/40 text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-6 transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
            <TrendingUp className="h-6 w-6 text-teal-200" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-100">รายงานภาพรวม</h3>
          <p className="text-sm text-slate-400">
            สรุปเช็คชื่อ/เบิก-ฝาก/ประกาศ ในช่วงเวลาที่กำหนด
          </p>
        </div>

        <div className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-6 transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
            <FileText className="h-6 w-6 text-amber-200" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-100">รายงานธุรกรรม</h3>
          <p className="text-sm text-slate-400">
            ดูรายงานเบิก/ฝาก แยกตามผู้เล่นและไอเท็ม
          </p>
        </div>

        <div className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-6 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
            <ClipboardList className="h-6 w-6 text-emerald-200" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-100">ประวัติส่วนตัว</h3>
          <p className="text-sm text-slate-400">
            ผู้เล่นดูประวัติการเช็คชื่อและการเบิกของของตัวเอง
          </p>
        </div>
      </div>
    </div>
  );
}
