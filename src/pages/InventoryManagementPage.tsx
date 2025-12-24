import { useEffect, useState } from "react";
import {
  Package,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  History,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Alert, useAlert } from "@/components/ui/alert";

// Import Resource Components
import { ResourceForm } from "@/components/resources/ResourceForm";
import { ResourceSummary } from "@/components/resources/ResourceSummary";
import { ResourceHistory } from "@/components/resources/ResourceHistory";

type Item = {
  id: number;
  name: string;
  currentStock: number;
  lastUpdated: string;
};

type ItemForm = {
  name: string;
  currentStock: number;
};

function formatDateTime(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InventoryManagementPage() {
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<
    "stock" | "transaction" | "summary" | "history"
  >("stock");

  // --- Stock Management Logic (Original) ---
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { alert: alertData, showSuccess, showError, closeAlert } = useAlert();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemForm>({
    name: "",
    currentStock: 0,
  });

  async function loadData() {
    setLoading(true);
    try {
      const res = await apiFetch<Item[]>("/inventory/items");
      setData(res);
    } catch (e) {
      showError(
        "โหลดข้อมูลไม่สำเร็จ",
        (e as any)?.message ?? "โหลดรายการไอเท็มไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "stock") {
      void loadData();
    }
  }, [activeTab]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      name: "",
      currentStock: 0,
    });
    setShowModal(true);
  }

  function openEditModal(item: Item) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      currentStock: item.currentStock,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingId) {
        // Update
        await apiFetch(`/inventory/items/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        // Create
        await apiFetch("/inventory/items", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      showSuccess(
        editingId ? "แก้ไขสำเร็จ" : "เพิ่มรายการสำเร็จ",
        "บันทึกข้อมูลเรียบร้อยแล้ว"
      );
      void loadData();
    } catch (e) {
      showError("บันทึกไม่สำเร็จ", (e as any)?.message ?? "บันทึกไม่สำเร็จ");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`คุณต้องการลบไอเท็ม "${name}" หรือไม่?`)) return;

    try {
      await apiFetch(`/inventory/items/${id}`, { method: "DELETE" });
      showSuccess("ลบรายการสำเร็จ", `ลบไอเท็ม "${name}" เรียบร้อยแล้ว`);
      void loadData();
    } catch (e) {
      showError("ลบไม่สำเร็จ", (e as any)?.message ?? "ลบไม่สำเร็จ");
    }
  }
  // --- End Stock Management Logic ---

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
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            จัดการคลังและทรัพยากร
          </h1>
          <p className="mt-1 text-slate-400">Inventory & Resource Management</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("stock")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "stock"
              ? "bg-slate-800 text-teal-400 border-b-2 border-teal-500"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Layers className="h-4 w-4" />
          จัดการ Stock
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "history"
              ? "bg-slate-800 text-teal-400 border-b-2 border-teal-500"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <History className="h-4 w-4" />
          ประวัติ
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "stock" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader
                icon={Package}
                title="รายการไอเท็มทั้งหมด"
                subtitle="All Items"
              />
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
              >
                <PlusCircle className="h-4 w-4" />
                เพิ่มไอเท็มใหม่
              </button>
            </div>

            <DataTable
              columns={[
                {
                  header: "ชื่อไอเท็ม",
                  accessor: (row) => (
                    <div className="font-medium text-slate-100">{row.name}</div>
                  ),
                  className: "min-w-[300px]",
                },
                {
                  header: "จำนวนคงเหลือ",
                  accessor: (row) => (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200">{row.currentStock}</span>
                      {row.currentStock < 10 && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/10 text-amber-200"
                        >
                          Stock ต่ำ
                        </Badge>
                      )}
                    </div>
                  ),
                  className: "min-w-[180px]",
                },
                {
                  header: "อัพเดทล่าสุด",
                  accessor: (row) => (
                    <div className="text-xs text-slate-400">
                      {formatDateTime(row.lastUpdated)}
                    </div>
                  ),
                  className: "min-w-[200px]",
                },
                {
                  header: "การทำงาน",
                  accessor: (row) => (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(row)}
                        className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800/50"
                      >
                        <Pencil className="mr-1 inline h-4 w-4" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.name)}
                        className="rounded-lg border border-rose-700/40 bg-rose-900/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-800/30"
                      >
                        <Trash2 className="mr-1 inline h-4 w-4" />
                        ลบ
                      </button>
                    </div>
                  ),
                  className: "min-w-[180px]",
                },
              ]}
              data={data}
              rowKey={(r) => r.id}
            />

            {!loading && data.length === 0 ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                ยังไม่มีไอเท็มในคลัง
              </div>
            ) : null}
          </div>
        )}

        {activeTab === "transaction" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ResourceForm />
          </div>
        )}

        {activeTab === "summary" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ResourceSummary />
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ResourceHistory />
          </div>
        )}
      </div>

      {/* Modal for Stock Management */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {editingId ? "แก้ไขไอเท็ม" : "เพิ่มไอเท็มใหม่"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  ชื่อไอเท็ม
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                  placeholder="เช่น ปืน AK-47"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  จำนวนคงเหลือ
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentStock: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
                >
                  {editingId ? "บันทึก" : "เพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Global Alert */}
      <Alert alert={alertData} onClose={closeAlert} />
    </div>
  );
}
