import { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Key,
  Shield,
  MoreVertical,
  Activity,
  Settings,
  Clock,
  Save,
  Wallet,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/ui/alert";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

// --- Types ---

type Member = {
  id: number;
  inGameName: string;
  phoneNumber: string;
  role: "ADMIN" | "USER";
  profileImageUrl?: string;
  createdAt: string;
};

type GlobalSetting = {
  id: number;
  key: string;
  value: string;
  description: string;
};

type GangTransaction = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  performedBy: string; // ชื่อคนทำรายการ
  createdAt: string;
};

type GangWalletData = {
  balance: number;
  transactions: GangTransaction[];
};

// --- Helpers ---

function formatDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("th-TH");
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
}

// --- Components ---

// 1. Gang Money Manager Component (New)
function GangMoneyManager({ isAdmin }: { isAdmin: boolean }) {
  const { showSuccess, showError } = useAlert();
  const [data, setData] = useState<GangWalletData>({
    balance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);

  // Transaction Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [txForm, setTxForm] = useState({ amount: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  async function loadWalletData() {
    setLoading(true);
    try {
      // Mock API endpoint - Replace with your actual endpoint
      const res = await apiFetch<GangWalletData>("/admin/gang-wallet");
      setData(res);
    } catch (error) {
      console.error(error);
      // Fallback for demo if API fails
      // setData({ balance: 50000, transactions: [] });
    } finally {
      setLoading(false);
    }
  }

  const openTransactionModal = (type: "INCOME" | "EXPENSE") => {
    setTxType(type);
    setTxForm({ amount: "", description: "" });
    setModalOpen(true);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/admin/gang-wallet/transaction", {
        method: "POST",
        body: JSON.stringify({
          type: txType,
          amount: Number(txForm.amount),
          description: txForm.description,
        }),
      });
      showSuccess(
        "ทำรายการสำเร็จ",
        `บันทึกรายการ ${
          txType === "INCOME" ? "รายรับ" : "รายจ่าย"
        } เรียบร้อยแล้ว`
      );
      setModalOpen(false);
      loadWalletData(); // Reload data
    } catch (err) {
      showError("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกรายการได้");
    } finally {
      setSubmitting(false);
    }
  };
  if (!isAdmin) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          <AlertTriangle className="mb-2 h-6 w-6" />
          <p className="font-semibold">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="mt-1 text-sm">
            เฉพาะ Admin เท่านั้นที่สามารถเข้าถึงหน้านี้ได้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Balance Card & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all"></div>

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-slate-400 font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                เงินกองกลาง (Gang Balance)
              </h3>
              <div className="mt-2 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 font-mono">
                {loading ? "..." : formatMoney(data.balance)}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => openTransactionModal("INCOME")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-600/30 hover:bg-teal-600/30 transition-all active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                ฝากเงินเข้า
              </button>
              <button
                onClick={() => openTransactionModal("EXPENSE")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-600/30 hover:bg-rose-600/30 transition-all active:scale-95"
              >
                <TrendingDown className="w-4 h-4" />
                เบิกเงินออก
              </button>
            </div>
          </div>
        </div>

        {/* Stats / Info Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-center">
          <h4 className="text-slate-400 text-sm mb-4">สรุปรายการวันนี้</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">รายการเข้า</span>
              <span className="text-teal-400 font-mono">
                +{" "}
                {formatMoney(
                  data.transactions
                    .filter((tx) => {
                      const txDate = new Date(tx.createdAt);
                      const today = new Date();
                      return (
                        tx.type === "INCOME" &&
                        txDate.toDateString() === today.toDateString()
                      );
                    })
                    .reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </span>
            </div>
            <div className="w-full h-px bg-slate-800"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">รายการออก</span>
              <span className="text-rose-400 font-mono">
                -{" "}
                {formatMoney(
                  data.transactions
                    .filter((tx) => {
                      const txDate = new Date(tx.createdAt);
                      const today = new Date();
                      return (
                        tx.type === "EXPENSE" &&
                        txDate.toDateString() === today.toDateString()
                      );
                    })
                    .reduce((sum, tx) => sum + tx.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Transaction History */}
      <div className="space-y-4">
        <SectionHeader
          icon={FileText}
          title="ประวัติการทำรายการ"
          subtitle="Recent Transactions"
        />

        {loading ? (
          <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/30">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <DataTable
            columns={[
              {
                header: "ประเภท",
                accessor: (row) => (
                  <div
                    className={cn(
                      "flex items-center gap-2 font-medium",
                      row.type === "INCOME" ? "text-teal-400" : "text-rose-400"
                    )}
                  >
                    {row.type === "INCOME" ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    {row.type === "INCOME" ? "รายรับ" : "รายจ่าย"}
                  </div>
                ),
                className: "w-[120px]",
              },
              {
                header: "จำนวนเงิน",
                accessor: (row) => (
                  <span
                    className={cn(
                      "font-mono font-bold",
                      row.type === "INCOME" ? "text-teal-200" : "text-rose-200"
                    )}
                  >
                    {row.type === "INCOME" ? "+" : "-"}{" "}
                    {formatMoney(row.amount)}
                  </span>
                ),
              },
              {
                header: "รายละเอียด",
                accessor: "description",
                className: "text-slate-300",
              },
              {
                header: "ทำโดย",
                accessor: (row) => (
                  <Badge
                    variant="outline"
                    className="bg-slate-800 text-slate-400 border-slate-700"
                  >
                    {row.performedBy}
                  </Badge>
                ),
              },
              {
                header: "วันที่",
                accessor: (row) => (
                  <span className="text-slate-500 text-xs">
                    {formatDateTime(row.createdAt)}
                  </span>
                ),
                className: "text-right",
              },
            ]}
            data={data.transactions}
            rowKey={(row) => row.id}
          />
        )}
      </div>

      {/* 3. Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={cn(
                  "text-xl font-bold flex items-center gap-2",
                  txType === "INCOME" ? "text-teal-400" : "text-rose-400"
                )}
              >
                {txType === "INCOME" ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                {txType === "INCOME"
                  ? "บันทึกรายรับ (Income)"
                  : "บันทึกรายจ่าย (Expense)"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  จำนวนเงิน (Amount)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors font-mono text-lg"
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  รายละเอียด / เหตุผล (Description)
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder={
                    txType === "INCOME"
                      ? "เช่น ขายของได้, เก็บค่าคุ้มครอง"
                      : "เช่น ซื้อยา, จ่ายค่าปรับ"
                  }
                  value={txForm.description}
                  onChange={(e) =>
                    setTxForm({ ...txForm, description: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-white font-medium shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                    txType === "INCOME"
                      ? "bg-teal-600 hover:bg-teal-700 shadow-teal-900/20"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-900/20"
                  )}
                >
                  {submitting ? "กำลังบันทึก..." : "ยืนยันรายการ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---

export default function AdminPage() {
  // Alert hook for beautiful notifications
  const { showSuccess, showError } = useAlert();

  // User authentication and admin check
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<
    "users" | "announcements" | "settings" | "money"
  >("users");

  // Users State
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Settings State
  // const [settings, setSettings] = useState<GlobalSetting[]>([]);
  // const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSetting, setSavingSetting] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState("10:00");

  // Modals (User)
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [resetTarget, setResetTarget] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  // Form State (User)
  const [formData, setFormData] = useState({
    inGameName: "",
    phoneNumber: "",
    password: "",
    role: "USER" as "ADMIN" | "USER",
  });
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (activeTab === "settings") {
      loadSettings();
    }
  }, [activeTab]);

  async function loadMembers() {
    setMembersLoading(true);
    try {
      const res = await apiFetch<Member[]>("/admin/users");
      setMembers(res);
    } catch (error) {
      console.error(error);
    } finally {
      setMembersLoading(false);
    }
  }

  async function loadSettings() {
    // setSettingsLoading(true);
    try {
      const res = await apiFetch<GlobalSetting[]>("/admin/settings");
      // setSettings(res);
      const timeSetting = res.find((s) => s.key === "attendance_deadline");
      if (timeSetting) setAttendanceTime(timeSetting.value);
    } catch (e) {
      console.error(e);
    } finally {
      // setSettingsLoading(false);
    }
  }

  async function saveSetting(key: string, value: string) {
    setSavingSetting(true);
    try {
      await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      });
      showSuccess("บันทึกสำเร็จ", "บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (e) {
      showError("เกิดข้อผิดพลาด", "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSavingSetting(false);
    }
  }

  // User Management Functions
  const openCreateModal = () => {
    setFormData({
      inGameName: "",
      phoneNumber: "",
      password: "",
      role: "USER",
    });
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setCreateOpen(false);
      loadMembers();
    } catch (err: any) {
      setCreateError(err.message || "สร้างสมาชิกไม่สำเร็จ");
    }
  };

  const openEditModal = (member: Member) => {
    setFormData({
      inGameName: member.inGameName,
      phoneNumber: member.phoneNumber,
      password: "", // Not used in edit
      role: member.role,
    });
    setEditTarget(member);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      await apiFetch(`/admin/users/${editTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          inGameName: formData.inGameName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        }),
      });
      setEditTarget(null);
      loadMembers();
    } catch (err) {
      console.error(err);
      showError("แก้ไขไม่สำเร็จ", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const confirmResetPassword = async () => {
    if (!resetTarget) return;
    try {
      const res = await apiFetch<{ resetTo: string }>(
        `/admin/users/${resetTarget.id}/reset-password`,
        { method: "PATCH" }
      );
      showSuccess(
        "รีเซ็ตรหัสผ่านสำเร็จ!",
        `รหัสผ่านใหม่คือ: ${res.resetTo} (กรุณาแจ้งให้ผู้ใช้ทราบ)`
      );
      setResetTarget(null);
    } catch (err) {
      console.error(err);
      showError("รีเซ็ตไม่สำเร็จ", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${deleteTarget.inGameName}?\nข้อมูลทั้งหมดรวมถึงประวัติธุรกรรมจะถูกลบถาวร`
      )
    )
      return;
    try {
      await apiFetch(`/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadMembers();
    } catch (err) {
      console.error(err);
      showError("ลบไม่สำเร็จ", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.inGameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phoneNumber.includes(searchQuery)
  );

  // Admin access check
  if (!isAdmin) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          <AlertTriangle className="mb-2 h-6 w-6" />
          <p className="font-semibold">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="mt-1 text-sm">
            เฉพาะ Admin เท่านั้นที่สามารถเข้าถึงหน้านี้ได้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">ผู้ดูแลระบบ</h1>
          <p className="mt-1 text-slate-400">Admin Management Console</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "users"
              ? "border-teal-500 text-teal-400 bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
          )}
        >
          <Users className="h-4 w-4" />
          จัดการสมาชิก (Users)
        </button>
        <button
          onClick={() => setActiveTab("money")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "money"
              ? "border-amber-500 text-amber-400 bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
          )}
        >
          <Wallet className="h-4 w-4" />
          จัดการเงินในแก๊ง (Gang Money)
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "announcements"
              ? "border-teal-500 text-teal-400 bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
          )}
        >
          <MoreVertical className="h-4 w-4" />
          จัดการประกาศ (Announcements)
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "settings"
              ? "border-blue-500 text-blue-400 bg-slate-900/40"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
          )}
        >
          <Settings className="h-4 w-4" />
          ตั้งค่าระบบ (System)
        </button>
      </div>

      {/* Content */}
      {activeTab === "users" ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
            <SectionHeader
              icon={Shield}
              title="รายชื่อสมาชิกทั้งหมด"
              subtitle={`Total Members: ${members.length}`}
            />
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ / เบอร์โทร..."
                  className="w-full md:w-64 rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                เพิ่มสมาชิก
              </button>
            </div>
          </div>

          {membersLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-12 text-center text-sm text-slate-400">
              กำลังโหลดข้อมูลสมาชิก...
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: "ชื่อในเกม",
                  accessor: "inGameName",
                  className: "min-w-[180px] font-medium text-slate-100",
                },
                {
                  header: "เบอร์ในเกม",
                  accessor: "phoneNumber",
                  className: "min-w-[140px] text-slate-200",
                },
                {
                  header: "บทบาท",
                  accessor: (row) => (
                    <Badge
                      variant="outline"
                      className={
                        row.role === "ADMIN"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                          : "border-slate-600/30 bg-slate-900/30 text-slate-200"
                      }
                    >
                      {row.role === "ADMIN" ? "ผู้ดูแล" : "ผู้ใช้"}
                    </Badge>
                  ),
                  className: "min-w-[120px]",
                },
                {
                  header: "วันที่สร้าง",
                  accessor: (row) => formatDate(row.createdAt),
                  className: "min-w-[120px] text-slate-300",
                },
                {
                  header: "การทำงาน",
                  accessor: (row) => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(row)}
                        className="rounded-lg border border-blue-700/40 bg-blue-900/40 px-3 py-1 text-xs text-blue-200 hover:bg-blue-800/50"
                        title="แก้ไข"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setResetTarget(row)}
                        className="rounded-lg border border-amber-700/40 bg-amber-900/40 px-3 py-1 text-xs text-amber-200 hover:bg-amber-800/50"
                        title="รีเซ็ตรหัส"
                      >
                        <Key className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(row)}
                        className="rounded-lg border border-rose-700/40 bg-rose-900/40 px-3 py-1 text-xs text-rose-200 hover:bg-rose-800/50"
                        title="ลบ"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ),
                  className: "min-w-[160px]",
                },
              ]}
              data={filteredMembers}
              rowKey={(r) => r.id}
            />
          )}
        </>
      ) : activeTab === "money" ? (
        <GangMoneyManager isAdmin={isAdmin} />
      ) : activeTab === "announcements" ? (
        <AnnouncementManager />
      ) : (
        // Settings Tab
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <SectionHeader
              icon={Clock}
              title="ตั้งค่าเวลาเช็คชื่อ"
              subtitle="Attendance Settings"
              className="mb-6"
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  กำหนดเวลาเช็คชื่อ (Cut-off Time)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={attendanceTime}
                    onChange={(e) => setAttendanceTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-100 text-lg rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 scheme-dark"
                  />
                  <span className="text-slate-500 text-sm">
                    ถ้าเช็คชื่อหลังเวลานี้ จะถือว่า "มาสาย/ขาด" ตามเงื่อนไข
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() =>
                    saveSetting("attendance_deadline", attendanceTime)
                  }
                  disabled={savingSetting}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingSetting ? (
                    <Activity className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Member Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-100">
                เพิ่มสมาชิกใหม่
              </div>
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800/50"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  ชื่อในเกม (In-Game Name)
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none"
                  value={formData.inGameName}
                  onChange={(e) =>
                    setFormData({ ...formData, inGameName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  เบอร์โทร (ใช้เป็น ID ล็อกอิน)
                </label>
                <input
                  required
                  type="text"
                  pattern="[0-9]*"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-400">
                    รหัสผ่านเริ่มต้น (Default Password is user123 if empty)
                  </label>
                  {formData.password.length > 0 &&
                    formData.password.length < 6 && (
                      <span className="text-[10px] text-red-400">
                        ต้องมีอย่างน้อย 6 ตัวอักษร
                      </span>
                    )}
                </div>
                <input
                  type="text"
                  placeholder="user123"
                  className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none ${
                    formData.password.length > 0 && formData.password.length < 6
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-slate-700 focus:border-teal-500"
                  }`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  บทบาท (Role)
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "ADMIN" | "USER",
                    })
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={
                    formData.password.length > 0 && formData.password.length < 6
                  }
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">
              แก้ไขข้อมูลสมาชิก
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  ชื่อในเกม
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  value={formData.inGameName}
                  onChange={(e) =>
                    setFormData({ ...formData, inGameName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  เบอร์โทร
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  บทบาท
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "ADMIN" | "USER",
                    })
                  }
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-slate-100">
              ยืนยันการรีเซ็ตรหัสผ่าน
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              คุณต้องการรีเซ็ตรหัสผ่านของ{" "}
              <span className="font-medium text-slate-200">
                {resetTarget.inGameName}
              </span>{" "}
              ใช่หรือไม่?
              <br />
              รหัสผ่านใหม่จะถูกสุ่มและแสดงให้คุณเห็นหลังจากยืนยัน
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetTarget(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmResetPassword}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-rose-400">
              ยืนยันการลบสมาชิก
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              คุณต้องการลบผู้ใช้{" "}
              <span className="font-medium text-slate-200">
                {deleteTarget.inGameName}
              </span>{" "}
              ใช่หรือไม่?
              <br />
              <span className="text-rose-500/80">
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
