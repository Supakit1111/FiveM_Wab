import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert, Alert } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api";

type RoundConfig = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

export function RoundConfigPanel() {
  const { showSuccess, showError, alert, closeAlert } = useAlert();
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRounds();
  }, []);

  useEffect(() => {
    console.log("Rounds state updated:", rounds);
  }, [rounds]);

  async function loadRounds() {
    setLoading(true);
    try {
      const settings = await apiFetch<any[]>("/admin/settings");
      const roundsSetting = settings.find((s) => s.key === "attendance_rounds");
      if (roundsSetting) {
        setRounds(JSON.parse(roundsSetting.value));
      } else {
        // Default if not setup
        setRounds([
          { id: 1, name: "รอบที่ 1", startTime: "20:00", endTime: "21:00" },
        ]);
      }
    } catch (e) {
      console.error(e);
      showError("Error", "Failed to load rounds configuration");
    } finally {
      setLoading(false);
    }
  }

  async function saveRounds() {
    console.log("Saving rounds:", rounds);
    setSaving(true);
    try {
      await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          key: "attendance_rounds",
          value: JSON.stringify(rounds),
        }),
      });
      showSuccess("บันทึกสำเร็จ", "บันทึกการตั้งค่ารอบเช็คชื่อเรียบร้อยแล้ว");
    } catch (e) {
      console.error("Save error:", e);
      showError("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setSaving(false);
    }
  }

  const addRound = () => {
    console.log("Adding round, current rounds:", rounds);
    setRounds((prevRounds) => {
      const nextId =
        prevRounds.length > 0
          ? Math.max(...prevRounds.map((r) => r.id)) + 1
          : 1;
      const newRounds = [
        ...prevRounds,
        {
          id: nextId,
          name: `รอบที่ ${nextId}`,
          startTime: "00:00",
          endTime: "23:59",
        },
      ];
      console.log("New rounds after add:", newRounds);
      return newRounds;
    });
  };

  const removeRound = (id: number) => {
    setRounds(rounds.filter((r) => r.id !== id));
  };

  const updateRound = (id: number, field: keyof RoundConfig, value: string) => {
    setRounds(rounds.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  if (loading)
    return <div className="text-slate-400">Loading configurations...</div>;

  return (
    <>
      <div className="space-y-6 bg-slate-900/40 p-4 md:p-6 rounded-xl border border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              ตั้งค่ารอบเช็คชื่อ (Attendance Rounds)
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              กำหนดช่วงเวลาสำหรับการเช็คชื่อในแต่ละวัน
            </p>
          </div>
          <Button
            onClick={saveRounds}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Config"}
          </Button>
        </div>

        {/* Rounds List */}
        <div className="space-y-4">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="group relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 md:p-6 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col gap-4">
                {/* Round Name */}
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ชื่อรอบ (Round Name)
                  </label>
                  <input
                    type="text"
                    value={round.name}
                    onChange={(e) =>
                      updateRound(round.id, "name", e.target.value)
                    }
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-base font-medium text-slate-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="เช่น รอบที่ 1, รอบเช้า"
                  />
                </div>

                {/* Check-in Time and Delete Button Row */}
                <div className="flex items-end gap-3">
                  {/* Check-in Time */}
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      เวลาเช็คชื่อ
                    </label>
                    <input
                      type="time"
                      value={round.startTime}
                      onChange={(e) =>
                        updateRound(round.id, "startTime", e.target.value)
                      }
                      className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-base font-mono text-slate-100 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all scheme-dark"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeRound(round.id)}
                    className="shrink-0 text-rose-400 hover:text-rose-300 transition-colors duration-200 p-3"
                    title="ลบรอบนี้"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Round Button */}

          <Button
            onClick={addRound}
            variant="outline"
            className="w-full border-2 border-dashed border-slate-700/50 hover:border-teal-500/50 hover:bg-teal-500/5 text-slate-400 hover:text-teal-400 py-6 rounded-xl transition-all duration-200 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            เพิ่มรอบเช็คชื่อ (Add Round)
          </Button>
        </div>
      </div>

      {/* Alert Component */}
      <Alert alert={alert} onClose={closeAlert} />
    </>
  );
}
