import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const G = "#C9A84C";
const G2 = "#7A6330";
const BG = "#080808";
const CARD = "#0F0F0F";
const CARD2 = "#141414";
const LINE = "#1C1C1C";
const TEXT = "#EDE8DF";
const DIM = "#444444";

const HABITS = [
  { week: 1, label: "Bangun awal" },
  { week: 2, label: "Belajar 1 jam sehari" },
  { week: 3, label: "Kurang screen" },
  { week: 4, label: "Solat tepat waktu" },
  { week: 5, label: "Baca Quran setiap hari" },
  { week: 6, label: "Banyakkan zikir" },
  { week: 7, label: "Jaga pandangan" },
  { week: 8, label: "Hidupkan solat sunat" },
  { week: 9, label: "Muhasabah sebelum tidur" },
  { week: 10, label: "Sedekah konsisten" },
  { week: 11, label: "Puasa Isnin & Khamis" },
  { week: 12, label: "Hadiri majlis ilmu" },
  { week: 13, label: "Kurang mengeluh, banyak syukur" },
  { week: 14, label: "Khidmat keluarga" },
  { week: 15, label: "Baca Al-Mulk tiap malam" },
  { week: 16, label: "Doa terperinci setiap hari" },
  { week: 17, label: "Solat Dhuha" },
  { week: 18, label: "Maafkan semua orang" },
  { week: 19, label: "Kawal makan" },
  { week: 20, label: "Perbaharui niat setiap hari" },
  { week: 21, label: "Audit & perbaiki habit" },
  { week: 22, label: "Hafal surah pendek" },
  { week: 23, label: "Zikir pagi & petang" },
  { week: 24, label: "Bangun sebelum Subuh" },
  { week: 25, label: "Cari mentor" },
  { week: 26, label: "Bersihkan harta" },
  { week: 27, label: "Faham makna solat" },
  { week: 28, label: "Kurang cakap, banyak fikir" },
  { week: 29, label: "Khidmat masyarakat" },
  { week: 30, label: "Jadi dakwah melalui akhlak" },
];

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const days = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
    return { key: dateKey(d), label: days[d.getDay()], isToday: i === 6 };
  });
}

function calcStreak(logs) {
  let streak = 0;
  const d = new Date();
  const todayLog = logs[dateKey(d)];
  if (!todayLog || !todayLog.some(Boolean)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    const k = dateKey(d);
    const l = logs[k];
    if (!l || !l.some(Boolean)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function Ring({ pct }) {
  const r = 36, c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="48" cy="48" r={r} fill="none" stroke={LINE} strokeWidth="5" />
      <circle cx="48" cy="48" r={r} fill="none" stroke={G} strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

export default function FitrahTracker() {
  const [week, setWeek] = useState(1);
  const [logs, setLogs] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  const today = dateKey();
  const active = HABITS.filter(h => h.week <= week);
  const rawChecks = logs[today] || [];
  const todayChecks = Array.from({ length: active.length }, (_, i) => rawChecks[i] || false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("fitrah:v1");
        if (r) {
          const d = JSON.parse(r.value);
          setWeek(d.week || 1);
          setLogs(d.logs || {});
        }
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("fitrah:v1", JSON.stringify({ week, logs })).catch(() => {});
  }, [week, logs, loaded]);

  const toggle = (i) => {
    const arr = Array.from({ length: active.length }, (_, j) => rawChecks[j] || false);
    arr[i] = !arr[i];
    setLogs(p => ({ ...p, [today]: arr }));
  };

  const done = todayChecks.filter(Boolean).length;
  const total = active.length;
  const todayPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const overallPct = Math.round((week / 30) * 100);
  const streak = calcStreak(logs);

  const last7 = getLast7();
  const chartData = last7.map(({ key, label, isToday }) => {
    const l = logs[key] || [];
    const d2 = l.filter(Boolean).length;
    const pct = total > 0 ? Math.round((d2 / total) * 100) : 0;
    return { label, pct, isToday };
  });

  if (!loaded) return (
    <div style={{ background: BG, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${G}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto", padding: "32px 20px 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        .tap { cursor: pointer; transition: opacity 0.15s; user-select: none; }
        .tap:active { opacity: 0.7; }
        @keyframes up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: up 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: 4, color: G2, textTransform: "uppercase", marginBottom: 6 }}>Projek Diri · 30 Minggu</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 34, fontWeight: 600, letterSpacing: 0.5, lineHeight: 1.1 }}>
          Kembali Kepada<br />Fitrah
        </h1>
      </div>

      {/* Week Selector */}
      <div className="fade tap" style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => setShowWeekPicker(!showWeekPicker)}>
        <div>
          <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Minggu Semasa</p>
          <p style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 600, color: G }}>Minggu {week} daripada 30</p>
        </div>
        <span style={{ color: DIM, fontSize: 13 }}>{showWeekPicker ? "▲" : "▼"}</span>
      </div>

      {showWeekPicker && (
        <div className="fade" style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, marginBottom: 14, display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 7 }}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(w => (
            <button key={w} className="tap" onClick={() => { setWeek(w); setShowWeekPicker(false); }} style={{
              background: week === w ? G : "transparent",
              border: `1px solid ${week === w ? G : LINE}`,
              borderRadius: 8, color: week === w ? BG : DIM,
              fontFamily: "'DM Sans'", fontSize: 12, padding: "7px 0",
              cursor: "pointer", fontWeight: week === w ? 500 : 400,
            }}>{w}</button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="fade" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["today", "chart"].map(t => (
          <button key={t} className="tap" onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 10,
            background: tab === t ? G : CARD,
            border: `1px solid ${tab === t ? G : LINE}`,
            color: tab === t ? BG : DIM,
            fontSize: 12, fontFamily: "'DM Sans'", fontWeight: 500, cursor: "pointer",
            letterSpacing: 1, textTransform: "uppercase",
          }}>
            {t === "today" ? "Hari Ini" : "Graf"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <>
          {/* Ring + Stats */}
          <div className="fade" style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "20px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Ring pct={todayPct} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 600, color: G }}>{todayPct}%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Status Hari Ini</p>
              {[
                { label: "Selesai", val: `${done} / ${total} habit` },
                { label: "Streak", val: `${streak} hari berturut` },
                { label: "Perjalanan", val: `${overallPct}% (${week}/30 minggu)` },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: DIM }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: TEXT }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="fade" style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase" }}>Kemajuan Keseluruhan</span>
              <span style={{ fontSize: 10, color: G }}>{overallPct}%</span>
            </div>
            <div style={{ height: 3, background: LINE, borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${overallPct}%`, background: G, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
          </div>

          {/* Habit list */}
          <div className="fade" style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Senarai Habit</p>
            {active.map((h, i) => {
              const checked = todayChecks[i];
              return (
                <div key={i} className="tap" onClick={() => toggle(i)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 0",
                  borderBottom: i < active.length - 1 ? `1px solid ${LINE}` : "none",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    border: `1.5px solid ${checked ? G : LINE}`,
                    background: checked ? G : "transparent",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {checked && <span style={{ fontSize: 11, color: BG, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, color: checked ? DIM : TEXT, textDecoration: checked ? "line-through" : "none", transition: "all 0.2s" }}>
                    {h.label}
                  </span>
                  <span style={{ fontSize: 9, color: checked ? G : DIM, background: LINE, padding: "2px 8px", borderRadius: 20, letterSpacing: 1 }}>
                    M{h.week}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "chart" && (
        <div className="fade">
          {/* 7 day bar */}
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "20px 18px", marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Rekod 7 Hari Lepas</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={26} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: DIM, fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: DIM, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: LINE }}
                  contentStyle={{ background: CARD2, border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 12, fontFamily: "DM Sans" }}
                  formatter={v => [`${v}%`, "Selesai"]}
                  labelStyle={{ color: TEXT }}
                />
                <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={e.pct === 0 ? LINE : e.isToday ? G : G2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Purata Minggu Ini", val: (() => { const vals = chartData.slice(-7).map(d => d.pct); return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length); })() + "%" },
              { label: "Terbaik 7 Hari", val: Math.max(...chartData.map(d => d.pct)) + "%" },
              { label: "Streak Semasa", val: `${streak} hari` },
              { label: "Habit Aktif", val: `${active.length} habit` },
            ].map(s => (
              <div key={s.label} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 14px" }}>
                <p style={{ fontSize: 10, color: DIM, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 600, color: G }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Weekly overview bar */}
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "20px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 10, color: DIM, letterSpacing: 2, textTransform: "uppercase" }}>Perjalanan 30 Minggu</p>
              <p style={{ fontSize: 10, color: G }}>{overallPct}%</p>
            </div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{
                  width: "calc(100% / 30 - 3px)", height: 6, borderRadius: 3,
                  background: i < week ? G : LINE,
                  opacity: i === week - 1 ? 1 : i < week ? 0.7 : 0.3,
                }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 10, color: DIM }}>Minggu 1</span>
              <span style={{ fontSize: 10, color: DIM }}>Minggu 30</span>
            </div>
          </div>
        </div>
      )}

      {/* Ayat footer */}
      <p style={{ textAlign: "center", fontSize: 11, color: G2, marginTop: 32, letterSpacing: 0.5, fontFamily: "'Cormorant Garamond'", fontStyle: "italic" }}>
        وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا
      </p>
      <p style={{ textAlign: "center", fontSize: 9, color: DIM, marginTop: 4, letterSpacing: 1 }}>
        AL-ANKABUT : 69
      </p>
    </div>
  );
}
