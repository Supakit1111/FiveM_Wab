import { useEffect, useMemo, useState } from "react";
import { Package, PlusCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Alert, useAlert } from "@/components/ui/alert";

type Item = {
  id: number;
  name: string;
  currentStock: number;
};

type TxRow = {
  id: number;
  transactionType: "WITHDRAWAL" | "DEPOSIT";
  quantity: number;
  reason?: string | null;
  timestamp: string;
  item: { id: number; name: string };
};

type ConfirmAction =
  | {
      type: "withdraw";
      item: Item;
      qty: number;
      reason?: string;
    }
  | {
      type: "deposit";
      item: Item;
      qty: number;
      reason?: string;
    };

export default function SelfServicePage() {
  // Alert hook for beautiful notifications
  const { alert: alertData, showSuccess, showError, closeAlert } = useAlert();
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [txs, setTxs] = useState<TxRow[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const [withdrawItemId, setWithdrawItemId] = useState<string>("");
  const [withdrawQty, setWithdrawQty] = useState<number>(1);
  const [withdrawReason, setWithdrawReason] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [depositItemId, setDepositItemId] = useState<string>("");
  const [depositQty, setDepositQty] = useState<number>(1);
  const [depositReason, setDepositReason] = useState<string>("");
  const [depositLoading, setDepositLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );

  const itemOptions = useMemo(
    () =>
      items.map((i) => ({
        value: String(i.id),
        label: `${i.name} (คงเหลือ ${i.currentStock})`,
      })),
    [items]
  );

  async function refreshItems() {
    setItemsLoading(true);
    try {
      const res = await apiFetch<Item[]>("/inventory/items");
      setItems(res);
      if (!withdrawItemId && res[0]) setWithdrawItemId(String(res[0].id));
      if (!depositItemId && res[0]) setDepositItemId(String(res[0].id));
    } catch (e) {
      showError(
        "โหลดข้อมูลไม่สำเร็จ",
        (e as any)?.message ?? "โหลดรายการไอเท็มไม่สำเร็จ"
      );
    } finally {
      setItemsLoading(false);
    }
  }

  async function refreshTx() {
    setTxLoading(true);
    try {
      const res = await apiFetch<TxRow[]>("/inventory/transactions/me");
      setTxs(res);
    } catch {
      // ignore
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    void refreshItems();
    void refreshTx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doWithdrawConfirmed(
    action: Extract<ConfirmAction, { type: "withdraw" }>
  ) {
    setWithdrawLoading(true);
    try {
      const body = {
        itemId: String(action.item.id),
        quantity: action.qty,
        reason: action.reason || undefined,
      };
      await apiFetch("/inventory/withdraw", {
        method: "POST",
        body: JSON.stringify(body),
      });
      showSuccess("ทำรายการเบิกสำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
      setWithdrawReason("");
      await refreshItems();
      await refreshTx();
    } catch (e) {
      showError("เบิกของไม่สำเร็จ", (e as any)?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setWithdrawLoading(false);
    }
  }

  async function doDepositConfirmed(
    action: Extract<ConfirmAction, { type: "deposit" }>
  ) {
    setDepositLoading(true);
    try {
      const body = {
        itemId: String(action.item.id),
        quantity: action.qty,
        reason: action.reason || undefined,
      };
      await apiFetch("/inventory/deposit", {
        method: "POST",
        body: JSON.stringify(body),
      });
      showSuccess("ทำรายการฝากสำเร็จ", "บันทึกข้อมูลเรียบร้อยแล้ว");
      setDepositReason("");
      await refreshItems();
      await refreshTx();
    } catch (e) {
      showError("ฝากของไม่สำเร็จ", (e as any)?.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setDepositLoading(false);
    }
  }

  async function confirmAndSubmit() {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action.type === "withdraw") {
      await doWithdrawConfirmed(action);
    } else {
      await doDepositConfirmed(action);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          บริการตนเองของผู้เล่น
        </h1>
        <p className="mt-1 text-slate-400">User Self-Service</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Card Removed as per user request (Admin handles attendance) */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <SectionHeader icon={Package} title="เบิกของ" subtitle="Withdrawal" />

          {!isAdmin ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
              เฉพาะ Admin เท่านั้นที่เบิกของได้
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="text-sm">
                <div className="mb-1 text-slate-300">ไอเท็ม</div>
                <select
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                  value={withdrawItemId}
                  onChange={(e) => setWithdrawItemId(e.target.value)}
                  disabled={itemsLoading}
                >
                  {itemOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="mb-1 text-slate-300">จำนวน</div>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                  value={withdrawQty}
                  onChange={(e) => setWithdrawQty(Number(e.target.value))}
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-slate-300">เหตุผล (ไม่บังคับ)</div>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="เช่น ใช้งานกิจกรรม..."
                />
              </label>

              <button
                className="mt-1 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60"
                disabled={withdrawLoading || itemsLoading}
                onClick={() => {
                  const item = items.find(
                    (i) => String(i.id) === withdrawItemId
                  );
                  if (!item) {
                    if (!item) {
                      showError("ไม่พบไอเท็ม", "กรุณาเลือกไอเท็มที่ต้องการ");
                      return;
                    }
                    return;
                  }
                  setConfirmAction({
                    type: "withdraw",
                    item,
                    qty: withdrawQty,
                    reason: withdrawReason || undefined,
                  });
                }}
              >
                {withdrawLoading ? "กำลังทำรายการ..." : "ยืนยันการเบิก"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <SectionHeader
            icon={PlusCircle}
            title="ฝากของ"
            subtitle="Deposit (Admin)"
          />
          {!isAdmin ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
              เฉพาะ Admin เท่านั้นที่ฝากของได้
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-sm">
                  <div className="mb-1 text-slate-300">ไอเท็ม</div>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                    value={depositItemId}
                    onChange={(e) => setDepositItemId(e.target.value)}
                    disabled={itemsLoading}
                  >
                    {itemOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-slate-300">จำนวน</div>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                    value={depositQty}
                    onChange={(e) => setDepositQty(Number(e.target.value))}
                  />
                </label>

                <label className="text-sm">
                  <div className="mb-1 text-slate-300">เหตุผล (ไม่บังคับ)</div>
                  <input
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm outline-none focus:border-teal-500/60"
                    value={depositReason}
                    onChange={(e) => setDepositReason(e.target.value)}
                    placeholder="เช่น เติม stock ประจำวัน"
                  />
                </label>

                <button
                  className="mt-1 w-full rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
                  disabled={depositLoading || itemsLoading}
                  onClick={() => {
                    const item = items.find(
                      (i) => String(i.id) === depositItemId
                    );
                    if (!item) {
                      if (!item) {
                        showError("ไม่พบไอเท็ม", "กรุณาเลือกไอเท็มที่ต้องการ");
                        return;
                      }
                      return;
                    }
                    setConfirmAction({
                      type: "deposit",
                      item,
                      qty: depositQty,
                      reason: depositReason || undefined,
                    });
                  }}
                >
                  {depositLoading ? "กำลังทำรายการ..." : "ยืนยันการฝาก"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-3 text-lg font-semibold text-slate-100">
              ยืนยันการทำรายการ
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-slate-400">ประเภท</div>
                <div className="font-medium">
                  {confirmAction.type === "withdraw"
                    ? "เบิกของ (WITHDRAWAL)"
                    : "ฝากของ (DEPOSIT)"}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-slate-400">ไอเท็ม</div>
                <div className="font-medium">{confirmAction.item.name}</div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-slate-400">คงเหลือก่อนทำรายการ</div>
                <div className="font-medium">
                  {confirmAction.item.currentStock}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-slate-400">จำนวน</div>
                <div className="font-medium">{confirmAction.qty}</div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-slate-400">คงเหลือหลังทำรายการ</div>
                <div
                  className={
                    confirmAction.type === "withdraw" &&
                    confirmAction.item.currentStock - confirmAction.qty < 0
                      ? "font-medium text-rose-200"
                      : "font-medium"
                  }
                >
                  {confirmAction.type === "withdraw"
                    ? confirmAction.item.currentStock - confirmAction.qty
                    : confirmAction.item.currentStock + confirmAction.qty}
                </div>
              </div>
              {confirmAction.reason ? (
                <div className="mt-3 text-xs text-slate-400">
                  เหตุผล: {confirmAction.reason}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800/50"
                onClick={() => setConfirmAction(null)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
                disabled={
                  (confirmAction.type === "withdraw" &&
                    confirmAction.item.currentStock - confirmAction.qty < 0) ||
                  withdrawLoading ||
                  depositLoading
                }
                onClick={confirmAndSubmit}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <SectionHeader
          icon={Package}
          title="ธุรกรรมล่าสุดของคุณ"
          subtitle="Inventory Transactions"
        />
        {txLoading ? (
          <div className="text-sm text-slate-400">กำลังโหลด...</div>
        ) : (
          <DataTable
            columns={[
              {
                header: "ประเภท",
                accessor: (row) => (
                  <Badge
                    variant="outline"
                    className={
                      row.transactionType === "WITHDRAWAL"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-teal-500/40 bg-teal-500/10 text-teal-200"
                    }
                  >
                    {row.transactionType}
                  </Badge>
                ),
                className: "min-w-[140px]",
              },
              {
                header: "ไอเท็ม",
                accessor: (row) => row.item?.name ?? "-",
                className: "min-w-[200px] font-medium text-slate-100",
              },
              {
                header: "จำนวน",
                accessor: (row) => String(row.quantity),
                className: "min-w-[100px] text-slate-200",
              },
              {
                header: "เหตุผล",
                accessor: (row) => row.reason ?? "-",
                className: "min-w-[240px] text-slate-300",
              },
              {
                header: "เวลา",
                accessor: (row) =>
                  new Date(row.timestamp).toLocaleString("th-TH"),
                className: "min-w-[180px] text-slate-400",
              },
            ]}
            data={txs}
            rowKey={(r) => r.id}
          />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-6 transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 transition-colors group-hover:bg-amber-500/20">
            <Package className="h-6 w-6 text-amber-200" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-100">เบิกของ</h3>
          <p className="text-sm text-slate-400">
            เลือกไอเท็มและจำนวน ระบบจะบันทึกและปรับยอดคงคลัง
          </p>
        </div>

        <div className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-6 transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 transition-colors group-hover:bg-teal-500/20">
            <PlusCircle className="h-6 w-6 text-teal-200" />
          </div>
          <h3 className="mb-2 font-semibold text-slate-100">ฝากของ</h3>
          <p className="text-sm text-slate-400">
            เพิ่มรายการเข้าคลังเพื่ออัปเดตยอดคงเหลือ
          </p>
        </div>
      </div>

      {/* Global Alert */}
      <Alert alert={alertData} onClose={closeAlert} />
    </div>
  );
}
