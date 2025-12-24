import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Loader2, Save } from "lucide-react";
import { Alert, useAlert } from "@/components/ui/alert";

interface Item {
  id: number;
  name: string;
  currentStock: number;
}

export function ResourceForm({ onSuccess }: { onSuccess?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { alert: alertData, showSuccess, showError, closeAlert } = useAlert();

  // Form State
  const [selectedItem, setSelectedItem] = useState("");
  const [type, setType] = useState("DEPOSIT"); // DEPOSIT | WITHDRAWAL
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  // ... existing code ...

  // ... existing code ...

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Item[]>("/inventory/items");
      setItems(res);
    } catch (e) {
      console.error(e);
      showError("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดรายการไอเท็มได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    setSubmitting(true);
    try {
      const endpoint =
        type === "DEPOSIT" ? "/inventory/deposit" : "/inventory/withdraw";

      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          itemId: Number(selectedItem),
          quantity: Number(quantity),
          reason: note,
        }),
      });

      // Reset
      setQuantity("");
      setNote("");
      showSuccess("บันทึกสำเร็จ", "รายการถูกบันทึกเรียบร้อยแล้ว");
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(
        "บันทึกไม่สำเร็จ",
        (error as any).message || "เกิดข้อผิดพลาดในการบันทึก"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden max-w-2xl mx-auto">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-teal-400">
          บันทึกรายการใหม่
        </h3>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                เลือกไอเทม
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">-- กรุณาเลือก --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (คงเหลือ: {item.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                ประเภทรายการ
              </label>
              <div className="flex bg-slate-950 rounded-md p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setType("DEPOSIT")}
                  className={`flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                    type === "DEPOSIT"
                      ? "bg-green-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  รับเข้า (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setType("WITHDRAWAL")}
                  className={`ml-2.5 flex-1 py-1.5 rounded text-sm font-medium transition-colors ${
                    type === "WITHDRAWAL"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ขายออก/ใช้ (Sell)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">จำนวน</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              หมายเหตุ (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px]"
              placeholder="เช่น ขายให้คุณ X, ได้จากกิจกรรม Y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-teal-600 text-white hover:bg-teal-700 h-10 px-4 py-2"
          >
            {submitting ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            บันทึกรายการ
          </button>
        </form>
      </div>

      {/* Global Alert */}
      <Alert alert={alertData} onClose={closeAlert} />
    </div>
  );
}
