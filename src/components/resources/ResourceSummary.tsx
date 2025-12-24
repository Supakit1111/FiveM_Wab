import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Loader2 } from "lucide-react";

interface SummaryItem {
  item: {
    id: number;
    name: string;
    currentStock: number;
  };
  receive: number;
  sell: number;
  net: number;
}

export function ResourceSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchSummary();
  }, [date]);

  // ... existing code ...

  // ... existing code ...

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<SummaryItem[]>(
        `/inventory/summary?date=${date}`
      );
      setSummary(res);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-300">
          เลือกวันที่:
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-slate-100"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-teal-400">
            สรุปรายวัน ({date})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              ไม่พบข้อมูลสำหรับวันนี้
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-slate-800 transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      ไอเทม
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-green-400 text-right">
                      รับเข้า
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-red-400 text-right">
                      ขายออก/ใช้
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-teal-400 text-right">
                      สุทธิ
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {summary.map((item) => (
                    <tr
                      key={item.item.id}
                      className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                    >
                      <td className="p-4 align-middle font-medium text-slate-200">
                        {item.item.name}
                      </td>
                      <td className="p-4 align-middle text-right text-green-400">
                        +{item.receive.toLocaleString()}
                      </td>
                      <td className="p-4 align-middle text-right text-red-400">
                        -{item.sell.toLocaleString()}
                      </td>
                      <td
                        className={`p-4 align-middle text-right font-bold ${
                          item.net >= 0 ? "text-teal-400" : "text-red-500"
                        }`}
                      >
                        {item.net > 0 ? "+" : ""}
                        {item.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
