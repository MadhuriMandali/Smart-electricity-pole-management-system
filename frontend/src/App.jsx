import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, MapPin, Mic, Square, Play, Pause, CheckCircle2, XCircle, Clock3,
  LogOut, User, ShieldCheck, Plus, ArrowLeft, Loader2, AlertTriangle,
  Trash2, RefreshCcw, Download, Search, FileText
} from "lucide-react";
import { api } from "./api";

/* ---------------------------------------------------------------------- */
/* Design tokens                                                          */
/* ---------------------------------------------------------------------- */
const C = {
  bg: "#EEF2F1", surface: "#FFFFFF", ink: "#1E2A38", muted: "#5B6672",
  line: "#D8DEE1", amber: "#FFB627", amberDark: "#C97F00", green: "#2E7D5B",
  greenBg: "#E4F0EA", red: "#C4482F", redBg: "#F8E7E1", grey: "#9AA1A9",
  greyBg: "#EBEDEE", navy: "#141C27",
};

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ---------------------------------------------------------------------- */
/* Signature graphic: the pole line                                       */
/* ---------------------------------------------------------------------- */
function Pole({ lit, dashed, size = 1 }) {
  const h = 64 * size, w = 34 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 34 64" fill="none">
      {dashed ? (
        <>
          <rect x="15" y="14" width="4" height="50" rx="1.5" stroke={C.grey} strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <line x1="4" y1="20" x2="30" y2="20" stroke={C.grey} strokeWidth="2" strokeDasharray="3 4" />
          <circle cx="17" cy="10" r="4" fill="none" stroke={C.red} strokeWidth="2" className="pw-pulse" />
          <circle cx="17" cy="10" r="2" fill={C.red} />
        </>
      ) : (
        <>
          <rect x="15" y="14" width="4" height="50" rx="1.5" fill={lit ? C.navy : C.grey} />
          <line x1="4" y1="20" x2="30" y2="20" stroke={lit ? C.navy : C.grey} strokeWidth="2.5" />
          <line x1="7" y1="14" x2="7" y2="26" stroke={lit ? C.navy : C.grey} strokeWidth="2" />
          <line x1="27" y1="14" x2="27" y2="26" stroke={lit ? C.navy : C.grey} strokeWidth="2" />
          <circle cx="17" cy="12" r="4.5" fill={lit ? C.amber : "none"} stroke={lit ? C.amber : C.grey} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

function PoleHorizon({ gapIndex = 3, count = 7 }) {
  const poles = Array.from({ length: count });
  return (
    <div className="relative flex items-end" style={{ height: 90 }}>
      <svg width="100%" height="24" className="absolute left-0" style={{ bottom: 40, zIndex: 0 }} preserveAspectRatio="none">
        <path d={`M 0 12 Q ${count * 20} 30 ${count * 46} 12`} stroke={C.line} strokeWidth="2" fill="none" />
      </svg>
      <div className="flex gap-3 relative z-10">
        {poles.map((_, i) => <Pole key={i} lit={i !== gapIndex} dashed={i === gapIndex} />)}
      </div>
    </div>
  );
}

function StatusTrack({ status }) {
  const stages = ["Pending", "Verified", "Resolved"];
  const idx = status === "Rejected" ? -1 : stages.indexOf(status);
  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: C.red }}>
        <XCircle size={16} /> Reported issue not confirmed
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((s, i) => (
        <React.Fragment key={s}>
          <Pole lit={i <= idx} size={0.55} />
          {i < stages.length - 1 && (
            <div style={{ width: 16, height: 2, background: i < idx ? C.navy : C.line, marginBottom: 24 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared UI atoms                                                         */
/* ---------------------------------------------------------------------- */
function Badge({ status }) {
  const map = {
    Pending: { bg: C.greyBg, fg: C.muted, icon: <Clock3 size={13} /> },
    Verified: { bg: "#FFF3DA", fg: C.amberDark, icon: <ShieldCheck size={13} /> },
    Resolved: { bg: C.greenBg, fg: C.green, icon: <CheckCircle2 size={13} /> },
    Rejected: { bg: C.redBg, fg: C.red, icon: <XCircle size={13} /> },
  };
  const s = map[status] || map.Pending;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.fg }}>
      {s.icon} {status}
    </span>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-20" style={{ background: C.bg }}>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="rounded-full p-1.5" style={{ background: C.surface }} aria-label="Go back">
            <ArrowLeft size={18} color={C.ink} />
          </button>
        )}
        <h1 className="font-bold text-lg" style={{ color: C.ink, fontFamily: "Archivo, sans-serif" }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Home                                                                    */
/* ---------------------------------------------------------------------- */
function Home({ onPick }) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.pendingCount().then((r) => setPendingCount(r.count)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <div className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} color={C.amberDark} fill={C.amber} />
          <span className="text-xs tracking-widest uppercase" style={{ color: C.muted, fontFamily: "IBM Plex Mono, monospace" }}>Rural Power Watch</span>
        </div>
        <h1 className="text-4xl leading-tight mt-2 font-black" style={{ color: C.ink, fontFamily: "Archivo, sans-serif" }}>
          No pole on<br />your street?
        </h1>
        <p className="text-sm mt-3 max-w-xs" style={{ color: C.muted }}>
          Record a voice message, drop a pin, and send it straight to the Electricity Department.
        </p>
      </div>

      <div className="px-6">
        <div className="rounded-2xl p-5" style={{ background: C.surface }}>
          <PoleHorizon />
          <p className="text-xs mt-3" style={{ color: C.grey, fontFamily: "IBM Plex Mono, monospace" }}>ONE GAP REPORTED · AWAITING INSPECTION</p>
        </div>
      </div>

      <div className="px-6 mt-8 flex flex-col gap-3">
        <button onClick={() => onPick("villager")} className="rounded-2xl p-5 text-left flex items-center justify-between" style={{ background: C.ink }}>
          <div>
            <div className="text-lg font-bold text-white" style={{ fontFamily: "Archivo, sans-serif" }}>I'm a villager</div>
            <div className="text-sm mt-0.5" style={{ color: "#AEB8C2" }}>Report a missing pole</div>
          </div>
          <User size={22} color={C.amber} />
        </button>
        <button onClick={() => onPick("admin")} className="rounded-2xl p-5 text-left flex items-center justify-between" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
          <div>
            <div className="text-lg font-bold flex items-center gap-2" style={{ color: C.ink, fontFamily: "Archivo, sans-serif" }}>
              Electricity Department
              {pendingCount > 0 && (
                <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: C.red, color: "white" }}>
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className="text-sm mt-0.5" style={{ color: C.muted }}>Review & verify complaints</div>
          </div>
          <ShieldCheck size={22} color={C.ink} />
        </button>
      </div>

      <div className="mx-6 mt-6 p-4 rounded-2xl text-xs" style={{ background: C.surface, border: `1.5px dashed ${C.line}`, color: C.muted }}>
        <div className="font-bold text-xs mb-1.5 flex items-center gap-1.5" style={{ color: C.ink }}>
          <Zap size={14} color={C.amberDark} /> CSP Project Demonstration Info:
        </div>
        <div className="flex flex-col gap-1">
          <div><span className="font-semibold" style={{ color: C.ink }}>Villager Login:</span> Ramesh Kumar (<span className="font-mono font-bold" style={{ color: C.ink }}>9848012345</span>) or any 10-digit number</div>
          <div><span className="font-semibold" style={{ color: C.ink }}>Department Sign-in:</span> Password is <span className="font-mono font-bold" style={{ color: C.ink }}>gridadmin</span></div>
          <div><span className="font-semibold" style={{ color: C.ink }}>Features:</span> Audio playback, real GPS pinning, status lifecycle & CSV report export</div>
        </div>
      </div>

      <p className="text-xs text-center mt-6 px-6" style={{ color: C.grey }}>
        Connected to backend at {api.base}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Villager: login                                                        */
/* ---------------------------------------------------------------------- */
function VillagerLogin({ onBack, onLoggedIn }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim() || phone.trim().length < 6) {
      setError("Enter your name and a valid phone number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const villager = await api.upsertVillager(name.trim(), phone.trim());
      localStorage.setItem("pw-villager", JSON.stringify(villager));
      onLoggedIn(villager);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <TopBar title="Villager sign in" onBack={onBack} />
      <div className="px-6 mt-4">
        <p className="text-sm mb-6" style={{ color: C.muted }}>
          Enter your name and phone number. We'll use this to find your complaints later — no password needed.
        </p>
        <label className="text-xs uppercase tracking-wide" style={{ color: C.muted }}>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Radha Devi"
          className="w-full mt-1 mb-4 px-4 py-3 rounded-xl text-base" style={{ background: C.surface, border: `1.5px solid ${C.line}`, color: C.ink }} />
        <label className="text-xs uppercase tracking-wide" style={{ color: C.muted }}>Phone number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))} placeholder="e.g. 9876543210" inputMode="tel"
          className="w-full mt-1 mb-2 px-4 py-3 rounded-xl text-base" style={{ background: C.surface, border: `1.5px solid ${C.line}`, color: C.ink, fontFamily: "IBM Plex Mono, monospace" }} />
        
        <div className="mt-3 mb-2">
          <span className="text-xs uppercase tracking-wide font-medium" style={{ color: C.muted }}>Quick demo profiles:</span>
          <div className="flex gap-2 flex-wrap mt-1.5">
            {[
              { name: "Ramesh Kumar", phone: "9848012345" },
              { name: "Radha Devi", phone: "9440156789" },
              { name: "Srinivasa Rao", phone: "9866234567" },
            ].map((p) => (
              <button
                key={p.phone}
                type="button"
                onClick={() => { setName(p.name); setPhone(p.phone); }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition"
                style={{ background: phone === p.phone ? C.ink : C.surface, color: phone === p.phone ? "white" : C.ink, border: `1px solid ${C.line}` }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: C.red }}><AlertTriangle size={14} /> {error}</p>}
        <button onClick={submit} disabled={busy} className="w-full mt-5 rounded-xl py-3.5 font-bold text-base" style={{ background: C.amber, color: C.navy, fontFamily: "Archivo, sans-serif" }}>
          {busy ? "Signing in…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Voice recorder                                                         */
/* ---------------------------------------------------------------------- */
function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => { if (s >= 59) { stop(); return s; } return s + 1; });
      }, 1000);
    } catch (e) {
      setError("Microphone access was blocked. Please allow microphone access and try again.");
    }
  }, [stop]);

  const reset = useCallback(() => {
    setAudioBlob(null); setAudioUrl(null); setSeconds(0);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  return { recording, seconds, audioBlob, audioUrl, error, start, stop, reset };
}

function VoiceRecorder({ onChange }) {
  const rec = useRecorder();
  const [playing, setPlaying] = useState(false);
  const audioElRef = useRef(null);

  useEffect(() => {
    if (rec.audioBlob) onChange(rec.audioBlob);
  }, [rec.audioBlob, onChange]);

  function togglePlay() {
    if (!audioElRef.current) return;
    if (playing) audioElRef.current.pause(); else audioElRef.current.play();
    setPlaying(!playing);
  }

  if (rec.audioUrl) {
    return (
      <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
        <button onClick={togglePlay} className="rounded-full p-3 flex-shrink-0" style={{ background: C.ink }} aria-label={playing ? "Pause recording" : "Play recording"}>
          {playing ? <Pause size={18} color="white" /> : <Play size={18} color="white" />}
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: C.ink }}>Voice message recorded</div>
          <div className="text-xs" style={{ color: C.grey, fontFamily: "IBM Plex Mono, monospace" }}>Tap to preview before sending</div>
        </div>
        <button onClick={() => { onChange(null); rec.reset(); setPlaying(false); }} className="rounded-full p-2" aria-label="Delete recording">
          <Trash2 size={16} color={C.red} />
        </button>
        <audio ref={audioElRef} src={rec.audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 flex flex-col items-center gap-3" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
      <button onClick={rec.recording ? rec.stop : rec.start} className="rounded-full p-6 relative" style={{ background: rec.recording ? C.red : C.amber }} aria-label={rec.recording ? "Stop recording" : "Start recording"}>
        {rec.recording && <span className="absolute inset-0 rounded-full pw-pulse" style={{ background: C.red }} />}
        {rec.recording ? <Square size={26} color="white" fill="white" className="relative" /> : <Mic size={26} color={C.navy} className="relative" />}
      </button>
      <div className="text-sm" style={{ color: rec.recording ? C.red : C.muted, fontFamily: "IBM Plex Mono, monospace" }}>
        {rec.recording ? `Recording… 0:${String(rec.seconds).padStart(2, "0")}` : "Tap to record your message"}
      </div>
      {rec.error && <p className="text-xs flex items-center gap-1" style={{ color: C.red }}><AlertTriangle size={13} /> {rec.error}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Location capture                                                       */
/* ---------------------------------------------------------------------- */
function LocationCapture({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function capture() {
    setError("");
    if (!navigator.geolocation) { setError("Location is not available on this device."); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); },
      () => { setError("Couldn't get your location. Please allow location access and try again."); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (value) {
    const { lat, lng } = value;
    const d = 0.006;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&marker=${lat}%2C${lng}`;
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.line}` }}>
        <iframe title="Complaint location" src={src} width="100%" height="160" style={{ border: 0, display: "block" }} />
        <div className="flex items-center justify-between px-4 py-3" style={{ background: C.surface }}>
          <span className="text-xs" style={{ color: C.muted, fontFamily: "IBM Plex Mono, monospace" }}>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
          <button onClick={capture} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.ink }}><RefreshCcw size={13} /> Update</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 flex flex-col items-center gap-3" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
      <button onClick={capture} disabled={loading} className="rounded-full p-5" style={{ background: C.ink }} aria-label="Share current location">
        {loading ? <Loader2 size={22} color="white" className="animate-spin" /> : <MapPin size={22} color={C.amber} />}
      </button>
      <div className="text-sm" style={{ color: C.muted }}>{loading ? "Getting your location…" : "Tap to share the location of the missing pole"}</div>
      {error && <p className="text-xs flex items-center gap-1" style={{ color: C.red }}><AlertTriangle size={13} /> {error}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* New complaint                                                          */
/* ---------------------------------------------------------------------- */
function NewComplaint({ villager, onBack, onSubmitted }) {
  const [audioBlob, setAudioBlob] = useState(null);
  const [loc, setLoc] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!audioBlob || !loc) {
      setError("Please record a voice message and share the location before sending.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.submitComplaint({
        phone: villager.phone, villagerName: villager.name,
        lat: loc.lat, lng: loc.lng, note, audioBlob,
      });
      onSubmitted();
    } catch (e) {
      setError(e.message || "Something went wrong sending your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <TopBar title="Report a missing pole" onBack={onBack} />
      <div className="px-6 flex flex-col gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: C.muted }}><Mic size={13} /> Voice message</div>
          <VoiceRecorder onChange={setAudioBlob} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: C.muted }}><MapPin size={13} /> Location</div>
          <LocationCapture value={loc} onChange={setLoc} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: C.muted }}>Anything else? (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Near the old well, three houses affected"
            className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: C.surface, border: `1.5px solid ${C.line}`, color: C.ink }} />
        </div>
        {error && <p className="text-sm flex items-center gap-1.5" style={{ color: C.red }}><AlertTriangle size={14} /> {error}</p>}
        <button onClick={submit} disabled={submitting} className="rounded-xl py-3.5 font-bold text-base" style={{ background: C.amber, color: C.navy, fontFamily: "Archivo, sans-serif" }}>
          {submitting ? "Sending…" : "Send to Electricity Department"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Villager dashboard                                                     */
/* ---------------------------------------------------------------------- */
function VillagerDashboard({ villager, onLogout }) {
  const [view, setView] = useState("list");
  const [complaints, setComplaints] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const mine = await api.myComplaints(villager.phone);
      setComplaints(mine);
    } catch (e) {
      setComplaints([]);
    }
  }, [villager.phone]);

  useEffect(() => { refresh(); }, [refresh]);

  if (view === "new") {
    return <NewComplaint villager={villager} onBack={() => setView("list")} onSubmitted={() => { setView("list"); refresh(); }} />;
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <TopBar title={`Hi, ${villager.name.split(" ")[0]}`} right={
        <button onClick={onLogout} className="rounded-full p-2" style={{ background: C.surface }} aria-label="Log out"><LogOut size={16} color={C.ink} /></button>
      } />
      <div className="px-6">
        <button onClick={() => setView("new")} className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 mb-6 font-bold text-base" style={{ background: C.ink, color: "white", fontFamily: "Archivo, sans-serif" }}>
          <Plus size={18} color={C.amber} /> Report a missing pole
        </button>
        <div className="text-xs uppercase tracking-wide mb-3" style={{ color: C.muted }}>Your complaints</div>
        {complaints === null && <p className="text-sm" style={{ color: C.grey }}>Loading…</p>}
        {complaints && complaints.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.surface, border: `1.5px dashed ${C.line}` }}>
            <p className="text-sm" style={{ color: C.muted }}>No complaints yet. If a street near you has no electricity pole, report it above.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {complaints && complaints.map((c) => (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: C.grey, fontFamily: "IBM Plex Mono, monospace" }}>{c.id}</span>
                <Badge status={c.status} />
              </div>
              <div className="text-xs mb-3" style={{ color: C.muted, fontFamily: "IBM Plex Mono, monospace" }}>{fmtTime(c.createdAt)}</div>
              <StatusTrack status={c.status} />
              {c.note && <p className="text-sm mt-3" style={{ color: C.ink }}>{c.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin login                                                             */
/* ---------------------------------------------------------------------- */
function AdminLogin({ onBack, onLoggedIn }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError("");
    try {
      const { token } = await api.adminLogin(pw);
      localStorage.setItem("pw-admin-token", token);
      onLoggedIn(token);
    } catch (e) {
      setError(e.message || "Incorrect password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <TopBar title="Department sign in" onBack={onBack} />
      <div className="px-6 mt-4">
        <p className="text-sm mb-6" style={{ color: C.muted }}>Staff access for reviewing and verifying villager complaints.</p>
        <label className="text-xs uppercase tracking-wide" style={{ color: C.muted }}>Password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full mt-1 mb-2 px-4 py-3 rounded-xl text-base" style={{ background: C.surface, border: `1.5px solid ${C.line}`, color: C.ink, fontFamily: "IBM Plex Mono, monospace" }} />
        <p className="text-xs mb-2" style={{ color: C.grey, fontFamily: "IBM Plex Mono, monospace" }}>Demo password: gridadmin (set ADMIN_PASSWORD env var on the backend to change it)</p>
        {error && <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: C.red }}><AlertTriangle size={14} /> {error}</p>}
        <button onClick={submit} disabled={busy} className="w-full mt-6 rounded-xl py-3.5 font-bold text-base" style={{ background: C.ink, color: "white", fontFamily: "Archivo, sans-serif" }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin dashboard                                                         */
/* ---------------------------------------------------------------------- */
function ComplaintCard({ c, onUpdate, isNew }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const d = 0.006;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - d}%2C${c.lat - d}%2C${c.lng + d}%2C${c.lat + d}&marker=${c.lat}%2C${c.lng}`;

  async function setStatus(status) {
    setBusy(true);
    await onUpdate(c.id, status);
    setBusy(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2" style={{ color: C.ink }}>
            {c.villagerName}
            {isNew && <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: C.red, color: "white" }}>New</span>}
          </div>
          <div className="text-xs" style={{ color: C.grey, fontFamily: "IBM Plex Mono, monospace" }}>{c.phone} · {c.id}</div>
        </div>
        <Badge status={c.status} />
      </div>
      <div className="text-xs mb-3" style={{ color: C.muted, fontFamily: "IBM Plex Mono, monospace" }}>{fmtTime(c.createdAt)}</div>

      <div className="rounded-xl p-3 flex items-center gap-3 mb-3" style={{ background: C.bg }}>
        <button onClick={togglePlay} className="rounded-full p-2.5 flex-shrink-0" style={{ background: C.ink }} aria-label={playing ? "Pause voice message" : "Play voice message"}>
          {playing ? <Pause size={15} color="white" /> : <Play size={15} color="white" />}
        </button>
        <span className="text-sm" style={{ color: C.ink }}>Villager's voice message</span>
        <audio ref={audioRef} src={api.audioUrl(c.audioUrl)} onEnded={() => setPlaying(false)} className="hidden" />
      </div>

      <div className="rounded-xl overflow-hidden mb-3" style={{ border: `1px solid ${C.line}` }}>
        <iframe title={`Location for ${c.id}`} src={mapSrc} width="100%" height="140" style={{ border: 0, display: "block" }} />
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: C.muted, fontFamily: "IBM Plex Mono, monospace" }}>{c.lat.toFixed(5)}, {c.lng.toFixed(5)}</span>
        <a href={`https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lng}#map=18/${c.lat}/${c.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold underline" style={{ color: C.ink }}>Open full map</a>
      </div>

      {c.note && <p className="text-sm mb-3" style={{ color: C.ink }}>{c.note}</p>}

      <div className="flex gap-2 flex-wrap">
        {c.status !== "Verified" && <button disabled={busy} onClick={() => setStatus("Verified")} className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1" style={{ background: "#FFF3DA", color: C.amberDark }}><ShieldCheck size={13} /> Mark verified</button>}
        {c.status !== "Resolved" && <button disabled={busy} onClick={() => setStatus("Resolved")} className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1" style={{ background: C.greenBg, color: C.green }}><CheckCircle2 size={13} /> Pole installed</button>}
        {c.status !== "Rejected" && <button disabled={busy} onClick={() => setStatus("Rejected")} className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1" style={{ background: C.redBg, color: C.red }}><XCircle size={13} /> Not genuine</button>}
        {c.status !== "Pending" && <button disabled={busy} onClick={() => setStatus("Pending")} className="rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1" style={{ background: C.greyBg, color: C.muted }}><Clock3 size={13} /> Reset</button>}
      </div>
    </div>
  );
}

function AdminDashboard({ token, onLogout }) {
  const [complaints, setComplaints] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastSeen, setLastSeen] = useState(() => parseInt(localStorage.getItem("pw-admin-last-seen") || "0", 10));
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const notifiedIdsRef = useRef(new Set());
  const sessionStartRef = useRef(Date.now());

  const refresh = useCallback(async () => {
    try {
      const all = await api.allComplaints(token);
      setComplaints(all);
      return all;
    } catch (e) {
      return [];
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      await refresh();
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const all = await refresh();
      all.forEach((c) => {
        if (c.createdAt > sessionStartRef.current && !notifiedIdsRef.current.has(c.id)) {
          notifiedIdsRef.current.add(c.id);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("New pole complaint", {
              body: `${c.villagerName} reported a missing pole near ${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}`,
            });
          }
        }
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleLogout() {
    localStorage.setItem("pw-admin-last-seen", String(Date.now()));
    localStorage.removeItem("pw-admin-token");
    onLogout();
  }

  async function updateStatus(id, status) {
    await api.updateStatus(token, id, status);
    await refresh();
  }

  function exportReportCSV() {
    if (!complaints || complaints.length === 0) return;
    const headers = ["Complaint ID", "Villager Name", "Phone", "Status", "Latitude", "Longitude", "Date Reported", "Notes"];
    const rows = complaints.map((c) => [
      `"${c.id}"`,
      `"${c.villagerName.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.status}"`,
      c.lat,
      c.lng,
      `"${new Date(c.createdAt).toLocaleString()}"`,
      `"${(c.note || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CSP_Pole_Watch_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const newSinceLastVisit = complaints ? complaints.filter((c) => c.createdAt > lastSeen).length : 0;
  const q = search.trim().toLowerCase();
  const filtered = complaints ? complaints.filter((c) => {
    const matchesFilter = filter === "All" || c.status === filter;
    if (!matchesFilter) return false;
    if (!q) return true;
    return (
      c.villagerName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.note && c.note.toLowerCase().includes(q))
    );
  }) : [];

  const counts = complaints ? {
    All: complaints.length,
    Pending: complaints.filter((c) => c.status === "Pending").length,
    Verified: complaints.filter((c) => c.status === "Verified").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
    Rejected: complaints.filter((c) => c.status === "Rejected").length,
  } : {};

  return (
    <div className="min-h-screen pb-8" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <TopBar title="Complaints" right={
        <div className="flex items-center gap-2">
          <button onClick={exportReportCSV} title="Export CSP Report to CSV" className="rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold" style={{ background: C.ink, color: "white" }}>
            <Download size={13} color={C.amber} /> Export CSV
          </button>
          <button onClick={refresh} className="rounded-full p-2" style={{ background: C.surface }} aria-label="Refresh"><RefreshCcw size={16} color={C.ink} /></button>
          <button onClick={handleLogout} className="rounded-full p-2" style={{ background: C.surface }} aria-label="Log out"><LogOut size={16} color={C.ink} /></button>
        </div>
      } />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-2 px-6 mb-4">
        <div className="rounded-xl p-2.5 text-center" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="text-base font-bold" style={{ color: C.ink }}>{counts.All || 0}</div>
          <div className="text-[10px] uppercase font-semibold" style={{ color: C.muted }}>Total</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: C.greyBg }}>
          <div className="text-base font-bold" style={{ color: C.ink }}>{counts.Pending || 0}</div>
          <div className="text-[10px] uppercase font-semibold" style={{ color: C.muted }}>Pending</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: "#FFF3DA" }}>
          <div className="text-base font-bold" style={{ color: C.amberDark }}>{counts.Verified || 0}</div>
          <div className="text-[10px] uppercase font-semibold" style={{ color: C.amberDark }}>Verified</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: C.greenBg }}>
          <div className="text-base font-bold" style={{ color: C.green }}>{counts.Resolved || 0}</div>
          <div className="text-[10px] uppercase font-semibold" style={{ color: C.green }}>Resolved</div>
        </div>
      </div>

      {newSinceLastVisit > 0 && (
        <div className="mx-6 mb-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "#FFF3DA" }}>
          <Zap size={15} color={C.amberDark} fill={C.amber} />
          <span className="text-sm font-medium" style={{ color: C.amberDark }}>{newSinceLastVisit} new complaint{newSinceLastVisit > 1 ? "s" : ""} since your last visit</span>
        </div>
      )}
      {notifPermission === "denied" && (
        <div className="mx-6 mb-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: C.greyBg }}>
          <AlertTriangle size={14} color={C.muted} />
          <span className="text-xs" style={{ color: C.muted }}>Browser notifications are blocked — enable them in your browser settings to get alerts for new complaints.</span>
        </div>
      )}

      {/* Search Input */}
      <div className="px-6 mb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3.5" style={{ color: C.grey }} />
          <input
            type="text"
            placeholder="Search by villager, phone, ID, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs"
            style={{ background: C.surface, border: `1.5px solid ${C.line}`, color: C.ink }}
          />
        </div>
      </div>

      <div className="px-6 flex gap-2 overflow-x-auto pb-4">
        {["All", "Pending", "Verified", "Resolved", "Rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ background: filter === f ? C.ink : C.surface, color: filter === f ? "white" : C.muted, border: `1px solid ${filter === f ? C.ink : C.line}` }}>
            {f} {counts[f] !== undefined ? `· ${counts[f]}` : ""}
          </button>
        ))}
      </div>
      <div className="px-6 flex flex-col gap-3">
        {complaints === null && <p className="text-sm" style={{ color: C.grey }}>Loading…</p>}
        {complaints && filtered.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: C.surface, border: `1.5px dashed ${C.line}` }}>
            <p className="text-sm" style={{ color: C.muted }}>No complaints in this category.</p>
          </div>
        )}
        {filtered.map((c) => <ComplaintCard key={c.id} c={c} onUpdate={updateStatus} isNew={c.createdAt > lastSeen} />)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App root                                                                */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [route, setRoute] = useState("home");
  const [villager, setVillager] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        .pw-pulse { animation: pwPulse 1.8s ease-in-out infinite; }
        @keyframes pwPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(1.5); } }
        @media (prefers-reduced-motion: reduce) { .pw-pulse { animation: none !important; } }
      `}</style>
      {route === "home" && <Home onPick={(r) => setRoute(r === "villager" ? "villagerLogin" : "adminLogin")} />}
      {route === "villagerLogin" && <VillagerLogin onBack={() => setRoute("home")} onLoggedIn={(v) => { setVillager(v); setRoute("villagerDash"); }} />}
      {route === "villagerDash" && villager && <VillagerDashboard villager={villager} onLogout={() => { setVillager(null); setRoute("home"); }} />}
      {route === "adminLogin" && <AdminLogin onBack={() => setRoute("home")} onLoggedIn={(token) => { setAdminToken(token); setRoute("adminDash"); }} />}
      {route === "adminDash" && adminToken && <AdminDashboard token={adminToken} onLogout={() => { setAdminToken(null); setRoute("home"); }} />}
    </div>
  );
}
