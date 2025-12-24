import { useEffect, useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Megaphone,
  Calendar,
  Bell,
} from "lucide-react"; // Added Bell here
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { apiFetch } from "@/lib/api";

type Announcement = {
  id: number;
  title: string;
  content: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED";
  priority: "URGENT" | "NORMAL";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementForm = {
  title: string;
  content: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED";
  priority: "URGENT" | "NORMAL";
  startDate: string;
  endDate: string;
};

function formatDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(dateString: string): string {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function AnnouncementManager() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: "",
    content: "",
    status: "ACTIVE",
    priority: "NORMAL",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Announcement[]>("/announcements");
      setData(res);
    } catch (e) {
      setError((e as any)?.message ?? "โหลดประกาศไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      status: "ACTIVE",
      priority: "NORMAL",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setShowModal(true);
  }

  function openEditModal(announcement: Announcement) {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      priority: announcement.priority,
      startDate: toDateInputValue(announcement.startDate),
      endDate: toDateInputValue(announcement.endDate),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await apiFetch(`/announcements/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/announcements", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      void loadData();
    } catch (e) {
      setError((e as any)?.message ?? "บันทึกไม่สำเร็จ");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("คุณต้องการลบประกาศนี้หรือไม่?")) return;

    setError(null);
    try {
      await apiFetch(`/announcements/${id}`, { method: "DELETE" });
      void loadData();
    } catch (e) {
      setError((e as any)?.message ?? "ลบไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          icon={Bell}
          title="จัดการประกาศ"
          subtitle="Announcement Management"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
        >
          <PlusCircle className="h-4 w-4" />
          สร้างประกาศใหม่
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            header: "หัวข้อ",
            accessor: (row) => (
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-100">
                  {row.title}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {row.content}
                </div>
              </div>
            ),
            className: "min-w-[260px]",
          },
          {
            header: "สถานะ",
            accessor: (row) => (
              <Badge
                variant="outline"
                className={
                  row.status === "ACTIVE"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : row.status === "DRAFT"
                    ? "border-slate-600/30 bg-slate-900/30 text-slate-200"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                }
              >
                {row.status}
              </Badge>
            ),
            className: "min-w-[100px]",
          },
          {
            header: "ความสำคัญ",
            accessor: (row) => (
              <Badge
                variant="outline"
                className={
                  row.priority === "URGENT"
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                    : "border-slate-600/30 bg-slate-900/30 text-slate-200"
                }
              >
                {row.priority}
              </Badge>
            ),
            className: "min-w-[100px]",
          },
          {
            header: "ช่วงเวลา",
            accessor: (row) => (
              <div className="text-xs text-slate-300">
                <div>เริ่ม: {formatDate(row.startDate)}</div>
                <div>สิ้นสุด: {formatDate(row.endDate)}</div>
              </div>
            ),
            className: "min-w-[160px]",
          },
          {
            header: "การทำงาน",
            accessor: (row: Announcement) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(row)}
                  className="rounded-lg border border-slate-700/40 bg-slate-900/40 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800/50"
                >
                  <Pencil className="mr-1 inline h-4 w-4" />
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="rounded-lg border border-rose-700/40 bg-rose-900/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-800/30"
                >
                  <Trash2 className="mr-1 inline h-4 w-4" />
                  ลบ
                </button>
              </div>
            ),
            className: "min-w-[150px]",
          },
        ]}
        data={data}
        rowKey={(r) => r.id}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {editingId ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
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
                  หัวข้อ
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  เนื้อหา
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    สถานะ
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as AnnouncementForm["status"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    ความสำคัญ
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target
                          .value as AnnouncementForm["priority"],
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    วันเริ่มต้น
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">
                    วันสิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
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
                  {editingId ? "บันทึก" : "สร้าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
