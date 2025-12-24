import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { setToken, setUser } from '../lib/auth'

type LoginResponse = {
  message: string
  token: string
  user: {
    id: number
    inGameName: string
    role: 'ADMIN' | 'USER'
    profileImageUrl?: string | null
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/dashboard'
  }, [location.state])

  const [phoneNumber, setPhoneNumber] = useState('123456')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, password }),
      })

      setToken(res.token)
      setUser(res.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = (err as { message?: string }).message ?? 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1100px] items-center px-4 py-10">
        <div className="grid w-full gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-sm text-slate-400">Game Manager</div>
            <h1 className="mt-1 text-2xl font-semibold">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm text-slate-400">
              ใช้เบอร์ในเกมเป็น Username และรหัสผ่านที่ตั้งไว้
            </p>

            <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
              <label className="text-sm">
                <div className="mb-1 text-slate-300">เบอร์ในเกม</div>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 outline-none focus:border-teal-500/60"
                  placeholder="123456"
                />
              </label>

              <label className="text-sm">
                <div className="mb-1 text-slate-300">รหัสผ่าน</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 outline-none focus:border-teal-500/60"
                  placeholder="••••••••"
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                disabled={loading}
                className="mt-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-6">
            <div className="text-xs font-medium text-teal-200">ฟังก์ชันหลัก</div>
            <div className="mt-3 grid gap-3 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Authentication & Account</div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Admin Panel</div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">User Self-Service</div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Announcement & Activity Log</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
