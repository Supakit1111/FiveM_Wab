import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Alert, useAlert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  KeyRound,
  Loader2,
  Save,
  Wallet,
  Calendar,
  Phone,
} from "lucide-react";

type UserProfile = {
  id: number;
  inGameName: string;
  phoneNumber: string;
  role: "ADMIN" | "USER";
  money: number;
  profileImageUrl: string | null;
  createdAt: string;
};

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { alert: alertData, showSuccess, showError, closeAlert } = useAlert();

  // Form States
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await apiFetch<UserProfile>("/me");
      setProfile(res);
      setName(res.inGameName);
    } catch (e) {
      showError("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify({ inGameName: name }),
      });
      showSuccess("บันทึกสำเร็จ", "ข้อมูลส่วนตัวถูกอัปเดตแล้ว");
      loadProfile(); // Refresh to ensure sync
    } catch (e) {
      showError("บันทึกไม่สำเร็จ", "ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("รหัสผ่านไม่ตรงกัน", "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 6) {
      showError(
        "รหัสผ่านสั้นเกินไป",
        "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
      );
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      showSuccess(
        "เปลี่ยนรหัสผ่านสำเร็จ",
        "รหัสผ่านของคุณถูกเปลี่ยนแปลงเรียบร้อยแล้ว"
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      showError(
        "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        (e as any).message || "รหัสผ่านปัจจุบันไม่ถูกต้อง"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-slate-400">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 fade-in animate-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <User className="h-8 w-8 text-teal-400" />
          ข้อมูลส่วนตัว
        </h1>
        <p className="mt-1 text-slate-400">
          จัดการข้อมูลบัญชีและรหัสผ่านของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col items-center text-center">
            {/* Avatar - Show Initials */}
            <div className="w-40 h-40 rounded-full border-4 border-slate-800 bg-gradient-to-br from-teal-600 to-teal-800 shadow-xl flex items-center justify-center mb-4">
              <span className="text-5xl font-bold text-white">
                {profile.inGameName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-1">
              {profile.inGameName}
            </h2>
            <Badge
              variant="outline"
              className="mb-6 border-slate-700 bg-slate-900 text-slate-300"
            >
              {profile.role}
            </Badge>

            <div className="w-full grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <Wallet className="w-4 h-4" /> ยอดเงิน
                </div>
                <div className="font-mono text-emerald-400 font-semibold text-lg">
                  ฿{profile.money.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" /> เข้าร่วมเมื่อ
                </div>
                <div className="text-slate-200 font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("th-TH", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2 mb-6 text-teal-400">
              <User className="w-5 h-5" />
              <h3 className="font-semibold text-lg">แก้ไขข้อมูลทั่วไป</h3>
            </div>

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อในเกม (In-Game Name)</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900/50 border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทร (Username)</Label>
                  <div className="relative">
                    <Input
                      value={profile.phoneNumber}
                      className="bg-slate-900/30 border-slate-800 pl-9 text-slate-500"
                      disabled
                    />
                    <Phone className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    *เบอร์โทรไม่สามารถแก้ไขได้
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  บันทึกข้อมูล
                </Button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex items-center gap-2 mb-6 text-amber-400">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold text-lg">เปลี่ยนรหัสผ่าน</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>รหัสผ่านปัจจุบัน</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-800 pl-9"
                    placeholder="••••••"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>รหัสผ่านใหม่</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-800"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ยืนยันรหัสผ่านใหม่</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-800"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="default"
                  disabled={saving}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  เปลี่ยนรหัสผ่าน
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Alert alert={alertData} onClose={closeAlert} />
    </div>
  );
}
