import { useState, useEffect, useRef } from "react";
import {
  Home, Timer, Award, Users, Brain, Flame, Coins, CheckCircle2,
  ChevronRight, Play, Pause, RotateCcw, Sparkles, BookOpen,
  Headphones, Eye, PenLine, Dumbbell, UserPlus, Lock, X
} from "lucide-react";

// ---------- Datos base ----------
const QUIZ_QUESTIONS = [
  {
    q: "Cuando estudias algo nuevo, ¿qué prefieres?",
    options: [
      { text: "Ver un diagrama o esquema", style: "visual" },
      { text: "Escuchar una explicación o podcast", style: "auditivo" },
      { text: "Leer un resumen escrito", style: "lectura" },
      { text: "Hacer un ejercicio práctico de inmediato", style: "kinestesico" },
    ],
  },
  {
    q: "En clases, ¿cómo recuerdas mejor la información?",
    options: [
      { text: "Con colores, imágenes o mapas mentales", style: "visual" },
      { text: "Repitiendo en voz alta lo que escuché", style: "auditivo" },
      { text: "Tomando apuntes detallados", style: "lectura" },
      { text: "Simulando o practicando el ejercicio", style: "kinestesico" },
    ],
  },
  {
    q: "Antes de una prueba, ¿qué método usas más?",
    options: [
      { text: "Reviso videos o infografías", style: "visual" },
      { text: "Discuto el tema con alguien", style: "auditivo" },
      { text: "Releo mis apuntes varias veces", style: "lectura" },
      { text: "Resuelvo ejercicios de práctica", style: "kinestesico" },
    ],
  },
  {
    q: "Si tuvieras que explicarle un tema a un compañero, ¿cómo lo harías?",
    options: [
      { text: "Dibujando un esquema en la pizarra", style: "visual" },
      { text: "Explicando en voz alta paso a paso", style: "auditivo" },
      { text: "Enviándole un documento escrito", style: "lectura" },
      { text: "Mostrándole cómo hacerlo en la práctica", style: "kinestesico" },
    ],
  },
  {
    q: "¿En qué ambiente te concentras mejor?",
    options: [
      { text: "Con material visual a la vista (posters, gráficos)", style: "visual" },
      { text: "Con música o podcasts de fondo", style: "auditivo" },
      { text: "En silencio, con textos y apuntes", style: "lectura" },
      { text: "Moviéndote o cambiando de actividad seguido", style: "kinestesico" },
    ],
  },
];

const STYLE_INFO = {
  visual: {
    label: "Visual",
    icon: Eye,
    color: "#1CB0F6",
    desc: "Aprendes mejor viendo la información: diagramas, colores y mapas mentales.",
    tips: [
      "Convierte tus apuntes en mapas mentales o esquemas de color.",
      "Usa videos cortos e infografías para repasar antes de una prueba.",
      "Resalta con colores distintos cada tipo de concepto.",
    ],
  },
  auditivo: {
    label: "Auditivo",
    icon: Headphones,
    color: "#8549BA",
    desc: "Retienes mejor lo que escuchas o conversas en voz alta.",
    tips: [
      "Graba tus propios resúmenes y escúchalos en tus tiempos muertos.",
      "Estudia en grupo explicando los temas en voz alta.",
      "Busca podcasts o clases grabadas sobre el tema.",
    ],
  },
  lectura: {
    label: "Lectura/Escritura",
    icon: PenLine,
    color: "#58CC02",
    desc: "Aprendes mejor leyendo y escribiendo tus propios apuntes.",
    tips: [
      "Reescribe tus apuntes con tus propias palabras después de cada clase.",
      "Haz resúmenes cortos y listas antes de cada sesión de estudio.",
      "Usa fichas de repaso (flashcards) con texto.",
    ],
  },
  kinestesico: {
    label: "Kinestésico",
    icon: Dumbbell,
    color: "#FF9600",
    desc: "Aprendes haciendo: practicar y aplicar es tu método más efectivo.",
    tips: [
      "Prioriza ejercicios prácticos por sobre la teoría pura.",
      "Usa técnicas Pomodoro con pausas activas de movimiento.",
      "Simula casos reales o problemas aplicados apenas puedas.",
    ],
  },
};

const ACHIEVEMENT_DEFS = [
  { id: "first_session", title: "Primer Enfoque", desc: "Completa tu primera sesión Pomodoro", icon: Timer,
    check: (s) => s.sessionsCompleted >= 1 },
  { id: "explorer", title: "Autoconocimiento", desc: "Descubre tu estilo de aprendizaje", icon: Brain,
    check: (s) => s.quizCompleted },
  { id: "streak3", title: "Racha de 3", desc: "Estudia 3 días seguidos", icon: Flame,
    check: (s) => s.streak >= 3 },
  { id: "marathon", title: "Maratonista", desc: "Acumula 100 minutos de estudio", icon: Sparkles,
    check: (s) => s.totalMinutes >= 100 },
  { id: "social", title: "En Comunidad", desc: "Agrega a un amigo", icon: Users,
    check: (s) => s.friendsAdded >= 1 },
  { id: "collector", title: "Coleccionista", desc: "Acumula 200 monedas", icon: Coins,
    check: (s) => s.coins >= 200 },
];

const INITIAL_FRIENDS = [
  { name: "Camila", xp: 480 },
  { name: "Matías", xp: 390 },
  { name: "Josefa", xp: 260 },
];

// ---------- Componentes auxiliares ----------
function TopStat({ icon: Icon, value, color }) {
  return (
    <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
      <Icon size={18} color={color} strokeWidth={2.5} />
      <span className="font-bold text-gray-700 text-sm">{value}</span>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-2xl transition-colors"
      style={{ color: active ? "#58CC02" : "#9CA3AF" }}
    >
      <Icon size={24} strokeWidth={active ? 2.6 : 2} fill={active ? "#DFF6C8" : "none"} />
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}

// ---------- App principal ----------
export default function StudyQuestApp() {
  const [tab, setTab] = useState("home");

  const [stats, setStats] = useState({
    xp: 120,
    coins: 40,
    streak: 2,
    sessionsCompleted: 1,
    totalMinutes: 25,
    quizCompleted: false,
    friendsAdded: 0,
  });

  const [learningStyle, setLearningStyle] = useState(null);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  const unlockedAchievements = ACHIEVEMENT_DEFS.filter((a) => a.check(stats));
  const nextLevelXp = 500;

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col items-center font-sans">
      <div className="w-full max-w-sm bg-[#F7F9F7] min-h-screen flex flex-col relative shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-[#F7F9F7] z-10">
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">StudyQuest</h1>
            <p className="text-xs text-gray-400 font-medium">Estudia, mejora, compite</p>
          </div>
          <div className="flex gap-2">
            <TopStat icon={Flame} value={stats.streak} color="#FF9600" />
            <TopStat icon={Coins} value={stats.coins} color="#FFC800" />
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
            <Sparkles size={16} color="#FFC800" /> {toast}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
          {tab === "home" && (
            <HomeTab stats={stats} nextLevelXp={nextLevelXp} learningStyle={learningStyle}
              unlocked={unlockedAchievements} friends={friends} setTab={setTab} />
          )}
          {tab === "pomodoro" && (
            <PomodoroTab stats={stats} setStats={setStats} showToast={showToast} />
          )}
          {tab === "quiz" && (
            <QuizTab stats={stats} setStats={setStats} learningStyle={learningStyle}
              setLearningStyle={setLearningStyle} showToast={showToast} />
          )}
          {tab === "achievements" && (
            <AchievementsTab stats={stats} />
          )}
          {tab === "friends" && (
            <FriendsTab stats={stats} setStats={setStats} friends={friends} setFriends={setFriends}
              showToast={showToast} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex px-1 py-1 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <NavButton icon={Home} label="Inicio" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton icon={Timer} label="Pomodoro" active={tab === "pomodoro"} onClick={() => setTab("pomodoro")} />
          <NavButton icon={Brain} label="Test" active={tab === "quiz"} onClick={() => setTab("quiz")} />
          <NavButton icon={Award} label="Logros" active={tab === "achievements"} onClick={() => setTab("achievements")} />
          <NavButton icon={Users} label="Amigos" active={tab === "friends"} onClick={() => setTab("friends")} />
        </div>
      </div>
    </div>
  );
}

// ---------- Home ----------
function HomeTab({ stats, nextLevelXp, learningStyle, unlocked, friends, setTab }) {
  const ranking = [...friends, { name: "Tú", xp: stats.xp, isUser: true }].sort((a, b) => b.xp - a.xp);
  const myRank = ranking.findIndex((r) => r.isUser) + 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gradient-to-br from-[#58CC02] to-[#46A302] rounded-3xl p-5 text-white shadow-md">
        <p className="text-sm font-semibold opacity-90">Tu progreso</p>
        <div className="flex items-end justify-between mt-1 mb-2">
          <span className="text-3xl font-extrabold">{stats.xp} XP</span>
          <span className="text-xs font-semibold opacity-90">Meta: {nextLevelXp} XP</span>
        </div>
        <ProgressBar value={stats.xp} max={nextLevelXp} color="#FFFFFF" />
        <p className="text-xs mt-2 opacity-90">Puesto #{myRank} entre tus amigos esta semana</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setTab("pomodoro")}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
          <Timer size={22} color="#1CB0F6" />
          <p className="font-bold text-gray-800 text-sm mt-2">Iniciar Pomodoro</p>
          <p className="text-xs text-gray-400">Gana puntos por enfocarte</p>
        </button>
        <button onClick={() => setTab("quiz")}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
          <Brain size={22} color="#8549BA" />
          <p className="font-bold text-gray-800 text-sm mt-2">Test de estilo</p>
          <p className="text-xs text-gray-400">
            {learningStyle ? `Eres ${STYLE_INFO[learningStyle].label}` : "Descubre cómo aprendes"}
          </p>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-gray-800 text-sm">Últimos logros</p>
          <button onClick={() => setTab("achievements")} className="text-[#1CB0F6] text-xs font-bold flex items-center gap-0.5">
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3">
          {unlocked.slice(-3).reverse().map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-1 w-16">
              <div className="w-12 h-12 rounded-full bg-[#FFF4DA] flex items-center justify-center">
                <a.icon size={20} color="#FFC800" />
              </div>
              <span className="text-[10px] text-gray-500 text-center font-medium leading-tight">{a.title}</span>
            </div>
          ))}
          {unlocked.length === 0 && (
            <p className="text-xs text-gray-400">Aún no tienes logros. ¡Completa una sesión Pomodoro!</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="font-bold text-gray-800 text-sm mb-2">Recomendación de hoy</p>
        {learningStyle ? (
          <p className="text-xs text-gray-500 leading-relaxed">{STYLE_INFO[learningStyle].tips[0]}</p>
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">
            Completa el test de estilo de aprendizaje para recibir recomendaciones personalizadas.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Pomodoro ----------
function PomodoroTab({ stats, setStats, showToast }) {
  const WORK_MIN = 25;
  const BREAK_MIN = 5;
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60);
  const [running, setRunning] = useState(false);
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
      const pointsEarned = WORK_MIN * 2; // 2 puntos por minuto enfocado
      const coinsEarned = Math.round(WORK_MIN / 5); // 5 monedas por sesión de 25 min
      setStats((s) => ({
        ...s,
        xp: s.xp + pointsEarned,
        coins: s.coins + coinsEarned,
        sessionsCompleted: s.sessionsCompleted + 1,
        totalMinutes: s.totalMinutes + WORK_MIN,
      }));
      showToast(`+${pointsEarned} XP · +${coinsEarned} monedas 🎉`);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      showToast("Descanso terminado. ¡A por otra sesión!");
      setMode("work");
      setSecondsLeft(WORK_MIN * 60);
    }
  };

  const reset = () => {
    setRunning(false);
    setMode("work");
    setSecondsLeft(WORK_MIN * 60);
  };

  const totalSeconds = (mode === "work" ? WORK_MIN : BREAK_MIN) * 60;
  const pct = 1 - secondsLeft / totalSeconds;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="flex gap-2 bg-gray-100 rounded-full p-1">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${mode === "work" ? "bg-white shadow text-[#58CC02]" : "text-gray-400"}`}>Enfoque</span>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${mode === "break" ? "bg-white shadow text-[#1CB0F6]" : "text-gray-400"}`}>Descanso</span>
      </div>

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg width="224" height="224" className="-rotate-90">
          <circle cx="112" cy="112" r={radius} stroke="#E5E7EB" strokeWidth="14" fill="none" />
          <circle cx="112" cy="112" r={radius} stroke={mode === "work" ? "#58CC02" : "#1CB0F6"} strokeWidth="14"
            fill="none" strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-gray-800">{mm}:{ss}</span>
          <span className="text-xs text-gray-400 font-semibold mt-1">
            {mode === "work" ? "Concéntrate en tu tarea" : "Estírate, respira, hidrátate"}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={reset} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRunning((r) => !r)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md"
          style={{ backgroundColor: mode === "work" ? "#58CC02" : "#1CB0F6" }}>
          {running ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
        </button>
        <div className="w-12 h-12" />
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full">
        <p className="font-bold text-gray-800 text-sm mb-1">Sistema de puntos</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Cada sesión de enfoque de 25 minutos completada sin pausar suma <b>+50 XP</b> y <b>+5 monedas</b>.
          Las monedas se pueden usar para desbloquear insignias especiales y subir en el ranking de amigos.
        </p>
      </div>
    </div>
  );
}

// ---------- Quiz ----------
function QuizTab({ stats, setStats, learningStyle, setLearningStyle, showToast }) {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState({ visual: 0, auditivo: 0, lectura: 0, kinestesico: 0 });
  const [result, setResult] = useState(learningStyle);

  const answer = (style) => {
    const newCounts = { ...counts, [style]: counts[style] + 1 };
    setCounts(newCounts);
    if (step + 1 < QUIZ_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      const top = Object.entries(newCounts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(top);
      setLearningStyle(top);
      if (!stats.quizCompleted) {
        setStats((s) => ({ ...s, quizCompleted: true, xp: s.xp + 30 }));
        showToast("+30 XP por conocerte mejor 🧠");
      }
    }
  };

  const restart = () => {
    setStep(0);
    setCounts({ visual: 0, auditivo: 0, lectura: 0, kinestesico: 0 });
    setResult(null);
  };

  if (result) {
    const info = STYLE_INFO[result];
    const Icon = info.icon;
    return (
      <div className="flex flex-col gap-4 pt-2">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: info.color + "22" }}>
            <Icon size={30} color={info.color} />
          </div>
          <p className="text-xs text-gray-400 font-semibold">Tu estilo predominante</p>
          <p className="text-xl font-extrabold text-gray-800">{info.label}</p>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{info.desc}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="font-bold text-gray-800 text-sm mb-2">Recomendaciones para ti</p>
          <div className="flex flex-col gap-2">
            {info.tips.map((t, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle2 size={16} color={info.color} className="mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={restart} className="text-xs font-bold text-gray-400 underline self-center">
          Volver a hacer el test
        </button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[step];
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-2">
        <BookOpen size={18} color="#8549BA" />
        <p className="text-xs font-bold text-gray-400">Pregunta {step + 1} de {QUIZ_QUESTIONS.length}</p>
      </div>
      <ProgressBar value={step} max={QUIZ_QUESTIONS.length} color="#8549BA" />
      <p className="font-extrabold text-gray-800 text-lg leading-snug mt-1">{q.q}</p>
      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(opt.style)}
            className="bg-white border-2 border-gray-100 rounded-2xl p-3.5 text-left text-sm font-semibold text-gray-700 hover:border-[#8549BA] hover:bg-[#F7F1FB] transition-colors">
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Achievements ----------
function AchievementsTab({ stats }) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="font-extrabold text-gray-800 text-lg">Tus logros</p>
      <p className="text-xs text-gray-400 -mt-2 mb-1">
        {ACHIEVEMENT_DEFS.filter((a) => a.check(stats)).length} de {ACHIEVEMENT_DEFS.length} desbloqueados
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENT_DEFS.map((a) => {
          const unlocked = a.check(stats);
          const Icon = a.icon;
          return (
            <div key={a.id}
              className={`rounded-2xl p-3.5 border ${unlocked ? "bg-white border-gray-100 shadow-sm" : "bg-gray-50 border-gray-100"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${unlocked ? "bg-[#FFF4DA]" : "bg-gray-200"}`}>
                {unlocked ? <Icon size={18} color="#FFC800" /> : <Lock size={16} color="#9CA3AF" />}
              </div>
              <p className={`text-sm font-bold ${unlocked ? "text-gray-800" : "text-gray-400"}`}>{a.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{a.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Friends ----------
function FriendsTab({ stats, setStats, friends, setFriends, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");

  const ranking = [...friends, { name: "Tú", xp: stats.xp, isUser: true }].sort((a, b) => b.xp - a.xp);

  const addFriend = () => {
    if (!name.trim()) return;
    setFriends((f) => [...f, { name: name.trim(), xp: Math.floor(Math.random() * 300) + 50 }]);
    setStats((s) => ({ ...s, friendsAdded: s.friendsAdded + 1 }));
    showToast(`${name.trim()} se unió a tu grupo de estudio 🤝`);
    setName("");
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="font-extrabold text-gray-800 text-lg">Ranking semanal</p>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 text-xs font-bold text-white bg-[#58CC02] px-3 py-1.5 rounded-full">
          <UserPlus size={14} /> Agregar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {ranking.map((r, i) => (
          <div key={r.name} className={`flex items-center gap-3 p-3 ${r.isUser ? "bg-[#F3FBEC]" : ""}`}>
            <span className="w-5 text-center font-extrabold text-gray-400 text-sm">{i + 1}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: r.isUser ? "#58CC02" : "#1CB0F6" }}>
              {r.name.charAt(0)}
            </div>
            <span className={`flex-1 text-sm font-semibold ${r.isUser ? "text-[#3C7A02]" : "text-gray-700"}`}>{r.name}</span>
            <span className="text-sm font-bold text-gray-500">{r.xp} XP</span>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40 px-6">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-3 right-3 text-gray-400">
              <X size={18} />
            </button>
            <p className="font-bold text-gray-800 mb-3">Nuevo amigo</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-[#58CC02]" />
            <button onClick={addFriend} className="w-full bg-[#58CC02] text-white font-bold rounded-xl py-2 text-sm">
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}