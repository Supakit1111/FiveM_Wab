import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { getToken, setToken, setUser } from "@/lib/auth";
import { Loader2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { OnlineUsers } from "@/components/OnlineUsers";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

function Starfield() {
  // Create a static array of stars to prevent hydration mismatches
  const stars = useRef(
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 2,
    }))
  ).current;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
      {/* Nebula Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/30 via-slate-950 to-teal-950/30 opacity-80" />

      {/* Moving Stars (Warp Effect) */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, 800], // Move down
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "linear",
          }}
          style={{
            left: `${star.x}%`,
            top: -20, // Start slightly above
            width: star.size,
            height: star.size * 5, // Stretch for speed effect
          }}
          className="absolute rounded-full bg-slate-200 blur-[1px]"
        />
      ))}

      {/* Grid Floor Effect (Perspective) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3 bg-[linear-gradient(to_bottom,transparent_0%,rgba(20,184,166,0.1)_100%)]"
        style={{ perspective: "1000px" }}
      >
        <div className="absolute inset-0 origin-bottom [transform:rotateX(60deg)] bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] animate-[grid-move_20s_linear_infinite]" />
      </div>
      <style>{`
        @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 0 60px; }
        }
      `}</style>
    </div>
  );
}

function UltimateCard({ children }: { children: React.ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth mouse values for Tilt
  const smoothX = useSpring(mouseX, { stiffness: 400, damping: 50 });
  const smoothY = useSpring(mouseY, { stiffness: 400, damping: 50 });

  // Tilt Transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Spotlight Gradient
  const spotlightBg = useMotionTemplate`radial-gradient(600px circle at ${useTransform(
    mouseX,
    [-0.5, 0.5],
    ["0%", "100%"]
  )} ${useTransform(
    mouseY,
    [-0.5, 0.5],
    ["0%", "100%"]
  )}, rgba(20, 184, 166, 0.15), transparent 80%)`;

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate percentage from center (-0.5 to 0.5)
    const xPct = (event.clientX - rect.left) / width - 0.5;
    const yPct = (event.clientY - rect.top) / height - 0.5;

    mouseX.set(xPct);
    mouseY.set(yPct);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }} // Continuous Floating Animation
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative z-10 w-full max-w-[440px]"
    >
      {/* Floating Elements (Deep Parallax) - Behind Card */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          translateX: useTransform(smoothX, [-0.5, 0.5], [-40, 40]),
          translateY: useTransform(smoothY, [-0.5, 0.5], [-40, 40]),
          translateZ: -50,
        }}
        className="absolute -right-20 -top-20 z-0 h-56 w-56 rounded-full bg-teal-500/20 blur-[80px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -60, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 1 }}
        style={{
          translateX: useTransform(smoothX, [-0.5, 0.5], [40, -40]),
          translateY: useTransform(smoothY, [-0.5, 0.5], [40, -40]),
          translateZ: -50,
        }}
        className="absolute -left-20 -bottom-20 z-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-[80px]"
      />

      {/* Main Card */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl shadow-teal-500/10"
        style={{ transform: "translateZ(0px)" }} // Card base
      >
        {/* Spotlight Effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-300"
          style={{ background: spotlightBg }}
        />

        {/* Scanner Line (Cyberpunk feel) */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-30 animate-[scan_4s_ease-in-out_infinite]" />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-10">{children}</div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from?.pathname || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (getToken()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phoneNumber, password }),
      });

      setToken(res.token);
      setUser(res.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      let msg = (err as { message?: string }).message ?? "เข้าสู่ระบบไม่สำเร็จ";

      // Translate common validation errors
      if (msg.includes("Expected string length greater or equal to 6")) {
        msg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      } else if (msg.includes("Invalid")) {
        msg = "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans text-slate-100 selection:bg-teal-500/30 overflow-hidden">
      {/* Immersive Background */}
      <Starfield />

      {/* Online Users (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <OnlineUsers />
      </div>

      <UltimateCard>
        {/* Deep Parallax Content Container */}
        <div style={{ transformStyle: "preserve-3d" }}>
          {/* Floating Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, z: 100 }}
            animate={{ opacity: 1, scale: 1, z: 50 }} // Floating out of card
            transition={{ duration: 0.8, type: "spring" }}
            style={{ transform: "translateZ(50px)" }}
            className="mb-8 flex flex-col items-center"
          >
            <div className="relative mb-6 group">
              <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-xl group-hover:bg-teal-500/30 transition-all duration-500" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative h-28 w-28 drop-shadow-[0_0_20px_rgba(20,184,166,0.6)]"
              >
                <img
                  src="/OMG.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </motion.div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-teal-100 to-teal-500">
              FiveM
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-500/80">
                Management System
              </p>
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Form Inputs */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="space-y-4">
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="In-Game Phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 pl-11 pr-4 py-4 text-slate-100 placeholder-slate-600 backdrop-blur-sm transition-all focus:border-teal-500/50 focus:bg-teal-950/20 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400">
                  <Zap className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 pl-11 pr-4 py-4 text-slate-100 placeholder-slate-600 backdrop-blur-sm transition-all focus:border-teal-500/50 focus:bg-teal-950/20 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 30px rgba(20, 184, 166, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-teal-400 py-4 font-bold text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span className="tracking-wide">LOGIN SYSTEM</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </div>
            </motion.button>
          </form>
        </div>
      </UltimateCard>

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest opacity-60">
          Secure Environment • v2.5.0
        </p>
      </div>
    </div>
  );
}
