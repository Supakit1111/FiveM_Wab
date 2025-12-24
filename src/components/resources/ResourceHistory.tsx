import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: number;
  quantity: number;
  transactionType: string;
  reason: string | null;
  timestamp: string;
  item: { name: string };
  user: { inGameName: string };
}

export function ResourceHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [type, setType] = useState("");
  const [itemId, setItemId] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [type, itemId]);

  // ... existing code ...

  // ... existing code ...

  const fetchItems = async () => {
    try {
      const res = await apiFetch<any[]>("/inventory/items");
      setItems(res);
    } catch (e) {}
  };

  const fetchTransactions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (itemId) params.append("itemId", itemId);

    try {
      const res = await apiFetch<{ transactions: Transaction[] }>(
        `/inventory/transactions?${params.toString()}`
      );
      setTransactions(res.transactions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
        >
          <option value="">ทุกไอเทม</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
        >
          <option value="">ทุกประเภทรายการ</option>
          <option value="DEPOSIT">รับเข้า (Deposit)</option>
          <option value="WITHDRAWAL">ขายออก/ใช้ (Withdraw)</option>
        </select>

        <button
          onClick={fetchTransactions}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded transition-colors"
        >
          รีเฟรช
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-teal-400">
            ประวัติการทำรายการล่าสุด
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-slate-800 transition-colors hover:bg-slate-800/50 data-[state=selected]:bg-slate-800">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      เวลา
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      ไอเทม
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      ประเภท
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-right text-slate-400">
                      จำนวน
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      ผู้ทำรายการ
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-400">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                    >
                      <td className="p-4 align-middle text-slate-300 font-mono text-xs">
                        {new Date(tx.timestamp).toLocaleString("th-TH", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 align-middle text-slate-200 font-medium">
                        {tx.item.name}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.transactionType === "DEPOSIT"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td
                        className={`p-4 align-middle text-right font-bold ${
                          tx.transactionType === "DEPOSIT"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {tx.transactionType === "DEPOSIT" ? "+" : ""}
                        {tx.quantity}
                      </td>
                      <td className="p-4 align-middle text-slate-400 text-sm">
                        {tx.user?.inGameName || "-"}_
                      </td>
                      <td className="p-4 align-middle text-slate-500 text-sm italic">
                        {tx.reason || "-"}_
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
