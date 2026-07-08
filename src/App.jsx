import { useState, useEffect, useRef } from "react";
import {
  Home, Timer as TimerIcon, Award, Play, Pause, RotateCcw,
  Coffee, BookOpen, Lock, Flame, Star, Users, X, ChevronRight,
} from "lucide-react";

// Prototipo simple: Dashboard (con ranking de amigos) + Temporizador + Logros.
// Sin quiz de estilos, sin pantalla de amigos aparte ni opción de agregar.

const WORK_MIN = 25;
const BREAK_MIN = 5;

const FRIENDS = [
  { name: "Camila", points: 80 },
  { name: "Matías", points: 45 },
  { name: "Josefa", points: 20 },
];

const ACHIEVEMENTS = [
  { id: "first", title: "Primer bloque", desc: "Completa tu primera sesión", icon: Star, need: (s) => s.sessions >= 1 },
  { id: "three", title: "Constancia", desc: "Completa 3 sesiones", icon: Flame, need: (s) => s.sessions >= 3 },
  { id: "fifty", title: "Medio centenar", desc: "Acumula 50 puntos", icon: Award, need: (s) => s.points >= 50 },
  { id: "hundred", title: "Cien puntos", desc: "Acumula 100 puntos", icon: Award, need: (s) => s.points >= 100 },
];

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
      style={{ color: active ? "#3B6E5E" : "#B3AB9C" }}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

export default function StudyTimerSimple() {
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [points, setPoints] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleComplete = () => {
    setRunning(false);
    if (mode === "work") {
      setSessions((s) => s + 1);
      setPoints((p) => p + 10);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      setMode("work");
      setSecondsLeft(WORK_MIN * 60);
    }
  };

  const reset = () => {
    setRunning(false);
    setMode("work");
    setSecondsLeft(WORK_MIN * 60);
  };

  const stats = { sessions, points };
  const unlocked = ACHIEVEMENTS.filter((a) => a.need(stats));

  return (
    <div className="min-h-screen bg-[#F3EFE7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-sm border border-[#E4DDCF] flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "home" && (
            <HomeTab stats={stats} unlocked={unlocked} setTab={setTab} />
          )}
          {tab === "timer" && (
            <TimerTab
              mode={mode} secondsLeft={secondsLeft} running={running}
              setRunning={setRunning} reset={reset}
            />
          )}
          {tab === "achievements" && (
            <AchievementsTab stats={stats} />
          )}
        </div>

        <div className="flex border-t border-[#EDE8DC] px-2 py-1 bg-white">
          <NavButton icon={Home} label="Inicio" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton icon={TimerIcon} label="Temporizador" active={tab === "timer"} onClick={() => setTab("timer")} />
          <NavButton icon={Award} label="Logros" active={tab === "achievements"} onClick={() => setTab("achievements")} />
        </div>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function HomeTab({ stats, unlocked, setTab }) {
  const [showRanking, setShowRanking] = useState(false);
  const ranking = [...FRIENDS, { name: "Tú", points: stats.points, isUser: true }]
    .sort((a, b) => b.points - a.points);
  const myRank = ranking.findIndex((r) => r.isUser) + 1;

  return (
    <div className="relative flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-[#2E2B26] tracking-tight">Hola de nuevo</h1>
        <p className="text-xs text-[#8A8377] mt-0.5">Aquí va tu resumen de hoy</p>
      </div>

      <div className="bg-[#3B6E5E] rounded-2xl p-4 text-white">
        <div className="flex justify-between">
          <div>
            <p className="text-2xl font-bold">{stats.sessions}</p>
            <p className="text-xs opacity-80">sesiones</p>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-2xl font-bold">{stats.points}</p>
            <p className="text-xs opacity-80">puntos</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setTab("timer")}
        className="bg-[#F3EFE7] rounded-2xl p-4 text-left border border-[#EDE8DC] hover:bg-[#EDE8DC] transition-colors"
      >
        <BookOpen size={20} color="#3B6E5E" />
        <p className="font-bold text-[#2E2B26] text-sm mt-2">Iniciar sesión de estudio</p>
        <p className="text-xs text-[#8A8377]">25 min de enfoque</p>
      </button>

      <div>
        <p className="text-xs font-bold text-[#8A8377] mb-2 uppercase tracking-wide">Logros recientes</p>
        {unlocked.length === 0 ? (
          <p className="text-xs text-[#B3AB9C]">Aún no tienes logros.</p>
        ) : (
          <div className="flex gap-2">
            {unlocked.slice(-3).map((a) => (
              <div key={a.id} className="w-10 h-10 rounded-full bg-[#FBEFDD] flex items-center justify-center">
                <a.icon size={16} color="#B8895A" />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowRanking(true)}
        className="flex items-center gap-3 bg-[#F3EFE7] rounded-2xl p-4 border border-[#EDE8DC] hover:bg-[#EDE8DC] transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-[#EAF2EC] flex items-center justify-center shrink-0">
          <Users size={17} color="#3B6E5E" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#2E2B26] text-sm">Ranking de amigos</p>
          <p className="text-xs text-[#8A8377]">Puesto #{myRank} de {ranking.length}</p>
        </div>
        <ChevronRight size={18} color="#B3AB9C" />
      </button>

      {showRanking && (
        <div className="absolute inset-0 bg-black/30 flex items-end justify-center z-40">
          <div className="bg-white rounded-t-3xl w-full max-w-xs p-5 max-h-[85%] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[#2E2B26] text-base">Ranking de amigos</p>
              <button onClick={() => setShowRanking(false)} className="text-[#B3AB9C]">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {ranking.map((r, i) => (
                <div
                  key={r.name}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.isUser ? "bg-[#EAF2EC] border border-[#3B6E5E]/20" : "bg-[#F3EFE7]"}`}
                >
                  <span className="w-4 text-center text-xs font-bold text-[#8A8377]">{i + 1}</span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: r.isUser ? "#3B6E5E" : "#B8895A" }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <span className={`flex-1 text-sm font-semibold ${r.isUser ? "text-[#3B6E5E]" : "text-[#2E2B26]"}`}>
                    {r.name}
                  </span>
                  <span className="text-sm font-bold text-[#8A8377]">{r.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Timer ----------
function TimerTab({ mode, secondsLeft, running, setRunning, reset }) {
  const total = (mode === "work" ? WORK_MIN : BREAK_MIN) * 60;
  const pct = 1 - secondsLeft / total;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const accent = mode === "work" ? "#3B6E5E" : "#B8895A";

  return (
    <div className="flex flex-col items-center gap-6 pt-2">
      <p className="text-xs font-semibold text-[#8A8377]">
        {mode === "work" ? "Bloque de enfoque" : "Pausa corta"}
      </p>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg width="192" height="192" className="-rotate-90">
          <circle cx="96" cy="96" r={radius} stroke="#EDE8DC" strokeWidth="10" fill="none" />
          <circle
            cx="96" cy="96" r={radius}
            stroke={accent} strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1">
          {mode === "work" ? <BookOpen size={18} color={accent} /> : <Coffee size={18} color={accent} />}
          <span className="text-2xl font-bold text-[#2E2B26] tabular-nums">{mm}:{ss}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-[#F3EFE7] flex items-center justify-center text-[#8A8377] hover:bg-[#EDE8DC] transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: accent }}
        >
          {running ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        <div className="w-10 h-10" />
      </div>
    </div>
  );
}

// ---------- Achievements ----------
function AchievementsTab({ stats }) {
  const count = ACHIEVEMENTS.filter((a) => a.need(stats)).length;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[#2E2B26]">Logros</h1>
        <p className="text-xs text-[#8A8377]">{count} de {ACHIEVEMENTS.length} desbloqueados</p>
      </div>
      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const done = a.need(stats);
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-2xl p-3 border ${done ? "bg-white border-[#EDE8DC]" : "bg-[#F3EFE7] border-[#EDE8DC]"}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: done ? "#FBEFDD" : "#E4DDCF" }}
              >
                {done ? <Icon size={18} color="#B8895A" /> : <Lock size={16} color="#B3AB9C" />}
              </div>
              <div>
                <p className={`text-sm font-bold ${done ? "text-[#2E2B26]" : "text-[#B3AB9C]"}`}>{a.title}</p>
                <p className="text-[11px] text-[#8A8377]">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}