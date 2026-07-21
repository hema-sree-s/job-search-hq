const { useState, useEffect, useCallback, useRef } = React;

/* ============================== ICONS ============================== */
const ICON_PATHS = {
  briefcase: "M20 7h-3V5.5A2.5 2.5 0 0 0 14.5 3h-5A2.5 2.5 0 0 0 7 5.5V7H4a1 1 0 0 0-1 1v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM9 5.5A.5.5 0 0 1 9.5 5h5a.5.5 0 0 1 .5.5V7H9V5.5z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5.4-5.4",
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  clipboard: "M9 2h6a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6 6 18M6 6l12 12",
  trash: "M4 7h16M9 7V4h6v3m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  check: "M20 6 9 17l-5-5",
  alert: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a1 1 0 0 0 .9 1.5h18.6a1 1 0 0 0 .9-1.5L13.7 3.9a1 1 0 0 0-1.7 0z",
  xcircle: "M15 9l-6 6M9 9l6 6",
  loader: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8",
  sparkles: "M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zM19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z",
  trending: "M3 17l6-6 4 4 8-8M15 7h6v6",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M11 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1",
  layers: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  lock: "M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

function Icon({ name, size = 16, className = "", spin = false }) {
  const path = ICON_PATHS[name];
  const isCircle = name === "xcircle";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={`${className} ${spin ? "spin" : ""}`}>
      {isCircle && <circle cx="12" cy="12" r="10" />}
      <path d={path} />
    </svg>
  );
}

/* ============================== ENCRYPTION (client-side only) ==============================
   All resume/job/interview/learning content is encrypted in the browser with a key
   derived from the user's password before it's ever sent to the server. The server
   only ever stores/returns opaque ciphertext blobs -- it cannot read your data,
   and neither can anyone with access to the database. Losing your password means
   losing access to old data, since there's no unencrypted copy anywhere to recover it from. */
const CRYPTO_ITERATIONS = 210000;

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function b64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const CRYPTO_HELPERS = {
  randomSaltB64() {
    return bufToB64(crypto.getRandomValues(new Uint8Array(16)));
  },
  async deriveKey(password, saltB64) {
    const enc = new TextEncoder();
    const salt = b64ToBuf(saltB64);
    const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: CRYPTO_ITERATIONS, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },
  async encryptJSON(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(obj));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
    return JSON.stringify({ iv: bufToB64(iv), data: bufToB64(ciphertext) });
  },
  async decryptJSON(key, blob) {
    if (!blob) return null;
    const { iv, data } = JSON.parse(blob);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBuf(iv) }, key, b64ToBuf(data));
    return JSON.parse(new TextDecoder().decode(plain));
  },
  async encryptBytes(key, arrayBuffer) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, arrayBuffer);
    return { ivB64: bufToB64(iv), dataB64: bufToB64(ciphertext) };
  },
  async decryptBytes(key, ivB64, dataB64) {
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBuf(ivB64) }, key, b64ToBuf(dataB64));
  },
};

/* ============================== API CLIENT ============================== */
const TOKEN_KEY = "jshq_token";

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
}

// Extracts plain text from a PDF entirely in the browser -- nothing is sent
// anywhere for this step, consistent with the rest of the app's privacy model.
async function extractPdfText(arrayBuffer) {
  if (!window.pdfjsLib) throw new Error("PDF reader didn't load. Check your connection and reload the page.");
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text.trim();
}
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearSession = () => localStorage.removeItem(TOKEN_KEY);

async function api(path, opts = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) { clearSession(); window.location.reload(); throw new Error("Session expired"); }
  return res;
}

/* ============================== HEURISTICS (local, always works) ============================== */
const ACTION_VERBS = [
  "achieved","managed","led","built","developed","designed","implemented","launched","created",
  "improved","increased","reduced","streamlined","negotiated","coordinated","analyzed","executed",
  "delivered","optimized","spearheaded","established","generated","resolved","mentored","trained",
  "automated","engineered","architected","drove","transformed","initiated","facilitated","produced",
  "directed","organized","secured","expanded","cut","saved","boosted","authored","owned",
  "scaled","modernized","redesigned","standardized","planned","supervised","forecasted","piloted"
];

const STOPWORDS = new Set(("the a an and or but if then else for of to in on at by with without "+
  "from as is are was were be been being this that these those it its into over under again further "+
  "once here there when where why how all any both each few more most other some such no nor not only "+
  "own same so than too very can will just should now you your yours we our ours they their them he she "+
  "his her i my me us also may might must shall while per etc within across including looking seeking "+
  "role team work strong ability experience years plus required preferred job description position "+
  "responsibilities requirements about company").split(" "));

const SKILLS_BANK = [
  "JavaScript","TypeScript","Python","Java","C++","C#","SQL","HTML","CSS","React","Angular","Vue",
  "Node.js","AWS","Azure","GCP","Docker","Kubernetes","Excel","PowerPoint","Salesforce","Tableau",
  "Project Management","Agile","Scrum","Communication","Leadership","Data Analysis","Machine Learning",
  "Marketing","SEO","Customer Service","Budgeting","Negotiation","Public Speaking","Content Writing",
  "Graphic Design","Photoshop","Figma","Git","API","REST","GraphQL","Ruby","PHP","Swift","Kotlin",
  "Linux","DevOps","CI/CD","Testing","QA","Sales","Accounting","Finance","Recruiting","Nursing",
  "Teaching","Compliance","Supply Chain","Logistics","Analytics","Forecasting","Stakeholder Management",
  "Cross-functional","Vendor Management","Product Management","UX Research","A/B Testing"
];

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Local, free, always-works guess at profile info from resume text -- no AI
// required. Never overwrites; callers merge this with what's already there.
function guessProfileFromResume(text) {
  const clean = (text || "").trim();
  if (!clean) return { headline: "", bio: "", skills: [] };
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  // Headline: the first short, name/title-like line near the top that isn't
  // contact info (email/phone/address-heavy).
  let headline = "";
  for (const line of lines.slice(0, 6)) {
    if (line.length > 3 && line.length <= 70 && !/[@]/.test(line) && !/\d{3}.*\d{4}/.test(line)) {
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 8) { headline = line; break; }
    }
  }

  // Bio: text following a Summary/Objective/Profile heading, up to the next
  // all-caps-ish section heading or a length cap.
  let bio = "";
  const summaryMatch = clean.match(/\b(summary|objective|profile)\b[:\s]*\n?([\s\S]{0,500}?)(\n[A-Z][A-Za-z\s]{2,30}\n|\n\n|$)/i);
  if (summaryMatch && summaryMatch[2]) {
    bio = summaryMatch[2].replace(/\s+/g, " ").trim().slice(0, 400);
  }

  // Skills: reuse the same keyword bank the Resume Scanner / Match Analyzer use.
  const lower = clean.toLowerCase();
  const skills = SKILLS_BANK.filter((s) => {
    const re = new RegExp(`\\b${escapeRegex(s.toLowerCase())}\\b`);
    return re.test(lower);
  });

  return { headline, bio, skills };
}

function analyzeResume(text) {
  const clean = (text || "").trim();
  if (!clean) return null;
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[-•*▪◦]|^\d+[.)]/.test(l));
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w-]+/.test(clean);
  const hasPhone = /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/.test(clean);
  const sections = {
    Experience: /\b(experience|employment|work history)\b/i.test(clean),
    Education: /\beducation\b/i.test(clean),
    Skills: /\bskills\b/i.test(clean),
    "Summary/Objective": /\b(summary|objective|profile)\b/i.test(clean),
  };
  const sectionsFoundCount = Object.values(sections).filter(Boolean).length;
  const verbBullets = bulletLines.filter((l) => {
    const w = l.replace(/^[-•*▪◦\d.)\s]+/, "").split(/\s+/)[0];
    return w && ACTION_VERBS.includes(w.toLowerCase().replace(/[^a-z]/g, ""));
  }).length;
  const verbRatio = bulletLines.length ? verbBullets / bulletLines.length : 0;
  const quantBullets = bulletLines.filter((l) => /\d/.test(l)).length;
  const quantRatio = bulletLines.length ? quantBullets / bulletLines.length : 0;
  const pronounCount = (clean.match(/\b(I|my|me)\b/g) || []).length;
  const avgBulletWords = bulletLines.length
    ? bulletLines.reduce((s, l) => s + l.split(/\s+/).length, 0) / bulletLines.length : 0;

  const checks = [];
  let total = 0;

  let pts = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0);
  total += pts;
  checks.push({ label: "Contact information", points: pts, max: 10, status: pts === 10 ? "pass" : pts === 0 ? "fail" : "warn",
    detail: `${hasEmail ? "Email found." : "No email found."} ${hasPhone ? "Phone number found." : "No phone number found."}` });

  pts = sectionsFoundCount * 5;
  total += pts;
  checks.push({ label: "Standard sections", points: pts, max: 20, status: sectionsFoundCount === 4 ? "pass" : sectionsFoundCount >= 2 ? "warn" : "fail",
    detail: `Detected: ${Object.entries(sections).filter(([, v]) => v).map(([k]) => k).join(", ") || "none"}.` });

  let lenPts = 0;
  if (wordCount >= 400 && wordCount <= 800) lenPts = 15;
  else if ((wordCount >= 300 && wordCount < 400) || (wordCount > 800 && wordCount <= 1000)) lenPts = 10;
  else if ((wordCount >= 200 && wordCount < 300) || (wordCount > 1000 && wordCount <= 1200)) lenPts = 5;
  total += lenPts;
  checks.push({ label: "Resume length", points: lenPts, max: 15, status: lenPts === 15 ? "pass" : lenPts >= 5 ? "warn" : "fail",
    detail: `${wordCount} words. Ideal range is roughly 400-800 words.` });

  let verbPts = bulletLines.length >= 3 ? Math.round(verbRatio * 20) : 0;
  total += verbPts;
  checks.push({ label: "Action-verb bullets", points: verbPts, max: 20, status: verbPts >= 16 ? "pass" : verbPts >= 8 ? "warn" : "fail",
    detail: bulletLines.length >= 3 ? `${verbBullets} of ${bulletLines.length} bullets start with a strong action verb.` : `Few or no bullet points detected.` });

  let quantPts = bulletLines.length >= 3 ? Math.round(quantRatio * 20) : 0;
  total += quantPts;
  checks.push({ label: "Quantified impact", points: quantPts, max: 20, status: quantPts >= 16 ? "pass" : quantPts >= 8 ? "warn" : "fail",
    detail: bulletLines.length >= 3 ? `${quantBullets} of ${bulletLines.length} bullets include a number, percentage, or dollar amount.` : `Add bullets with measurable results.` });

  let pronPts = pronounCount === 0 ? 10 : pronounCount <= 2 ? 7 : pronounCount <= 5 ? 4 : 0;
  total += pronPts;
  checks.push({ label: "First-person pronouns", points: pronPts, max: 10, status: pronPts >= 7 ? "pass" : pronPts >= 4 ? "warn" : "fail",
    detail: `Found "I / my / me" ${pronounCount} time(s).` });

  let blPts = avgBulletWords === 0 ? 0 : avgBulletWords <= 22 ? 5 : avgBulletWords <= 30 ? 3 : 0;
  total += blPts;
  checks.push({ label: "Bullet length", points: blPts, max: 5, status: blPts === 5 ? "pass" : blPts >= 3 ? "warn" : "fail",
    detail: avgBulletWords ? `Average bullet is ~${Math.round(avgBulletWords)} words.` : "No bullets detected." });

  return { total: Math.min(100, total), checks, wordCount };
}

function extractKeywords(jobDesc) {
  const clean = (jobDesc || "").trim();
  if (!clean) return [];
  const skillMatches = SKILLS_BANK.filter((s) => new RegExp(`\\b${escapeRegex(s)}\\b`, "i").test(clean));
  const bigramSet = new Set();
  const bigramRe = /\b([A-Z][a-zA-Z]{2,})\s+([A-Z][a-zA-Z]{2,})\b/g;
  let m;
  while ((m = bigramRe.exec(clean)) && bigramSet.size < 8) {
    const phrase = `${m[1]} ${m[2]}`;
    if (!/^(The|This|That|Our|Your|You|We|They|Please|About)\s/.test(phrase)) bigramSet.add(phrase);
  }
  const tokens = (clean.toLowerCase().match(/[a-z0-9+#.]{3,}/g) || []).filter((t) => !STOPWORDS.has(t));
  const freq = {};
  tokens.forEach((t) => (freq[t] = (freq[t] || 0) + 1));
  const topFreq = Object.entries(freq).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
  const lowerSkills = new Set(skillMatches.map((s) => s.toLowerCase()));
  const combined = [...skillMatches, ...[...bigramSet], ...topFreq.filter((w) => !lowerSkills.has(w))];
  return [...new Set(combined)].slice(0, 24);
}

function computeMatch(jobDesc, resumeText) {
  const keywords = extractKeywords(jobDesc);
  if (keywords.length === 0) return null;
  const matched = keywords.filter((k) => new RegExp(`\\b${escapeRegex(k)}\\b`, "i").test(resumeText || ""));
  const missing = keywords.filter((k) => !matched.includes(k));
  const score = Math.round((matched.length / keywords.length) * 100);
  return { score, matched, missing, keywords };
}

/* ============================== SMALL UI PIECES ============================== */
function scoreColor(score) {
  if (score >= 75) return { text: "text-green", ring: "#7FCB9C" };
  if (score >= 50) return { text: "text-amberc", ring: "#E8C171" };
  return { text: "text-rust", ring: "#E58C7E" };
}

function ScoreGauge({ score, size = 110 }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const colors = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#EDE7F7" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={colors.ring} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset .7s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`jshq-mono text-2xl font-medium ${colors.text}`}>{score}</span>
        <span className="text-muted text-xs jshq-mono" style={{ fontSize: 10 }}>/ 100</span>
      </div>
    </div>
  );
}

function UploadPdfButton({ onExtracted, toast, label = "Upload PDF" }) {
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { toast("error", "Only PDF files are supported."); return; }
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const text = await extractPdfText(buf);
      if (!text.trim()) {
        toast("error", "Couldn't find any text in that PDF -- it may be a scanned image without a text layer.");
      } else {
        onExtracted(text);
        toast("success", "Text extracted from PDF.");
      }
    } catch (err) {
      toast("error", err.message || "Couldn't read that PDF.");
    }
    setBusy(false);
  };

  return (
    <label className="btn-ghost rounded px-4 py-2 text-sm font-medium flex items-center gap-2 focus-ring cursor-pointer">
      {busy ? <Icon name="loader" size={16} spin /> : <Icon name="clipboard" size={16} />} {busy ? "Reading..." : label}
      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" disabled={busy} />
    </label>
  );
}

function StatusIcon({ status }) {
  if (status === "pass") return <Icon name="check" size={16} className="text-green shrink-0" />;
  if (status === "warn") return <Icon name="alert" size={16} className="text-amberc shrink-0" />;
  return <Icon name="xcircle" size={16} className="text-rust shrink-0" />;
}

function Chip({ children, tone = "green" }) {
  const styles = { green: { color: "#4E9C6E", borderColor: "#BFE5CE" }, rust: { color: "#D97862", borderColor: "#F3C9C0" } };
  return <span className="chip" style={styles[tone]}>{children}</span>;
}

function StatCard({ iconName, label, value, tone = "brass" }) {
  const toneColor = { brass: "#B9A0EA", green: "#4E9C6E", amberc: "#C99A3D", slateblue: "#8C93B8" }[tone];
  return (
    <div className="stat-card rounded-lg p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: `${toneColor}22` }}>
        <Icon name={iconName} size={16} className="" />
      </div>
      <div>
        <p className="jshq-mono text-xl leading-none text-paper">{value}</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}

function AISkeleton() {
  return (
    <div className="space-y-2.5 py-1">
      <div className="skeleton h-3.5 w-11/12" />
      <div className="skeleton h-3.5 w-4/5" />
      <div className="skeleton h-3.5 w-3/5" />
    </div>
  );
}

function ToastStack({ toasts, remove }) {
  const colors = { success: "#4E9C6E", error: "#D97862", info: "#8C93B8" };
  const iconFor = { success: "check", error: "xcircle", info: "info" };
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map((t) => (
        <div key={t.id} className="toast bg-ink3 border border-hair rounded-lg px-3.5 py-2.5 flex items-start gap-2 shadow-lg">
          <Icon name={iconFor[t.type] || "info"} size={16} className="shrink-0 mt-0.5" />
          <p className="text-sm text-main flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-muted hover:text-main shrink-0" aria-label="Dismiss">
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function initials(name) {
  return (name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
}

/* ============================== AUTH SCREEN ============================== */
function AuthScreen({ onAuthed, onGoogleResult, toast }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [googleClientId, setGoogleClientId] = useState(null);
  const googleBtnRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) return;
    setBusy(true);
    try {
      const body = { username: username.trim(), password };
      if (mode === "signup") body.salt = CRYPTO_HELPERS.randomSaltB64();

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setBusy(false); return; }

      const key = await CRYPTO_HELPERS.deriveKey(password, data.salt);
      setToken(data.token);
      toast("success", mode === "signup" ? `Welcome, ${data.username}!` : `Welcome back, ${data.username}!`);
      onAuthed(data.username, key);
    } catch (err) {
      setError("Couldn't reach the server. Is it deployed and configured?");
      setBusy(false);
    }
  };

  // Ask the server whether Google Sign-In is configured on this deployment
  // (it's optional -- the app works fully without it).
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        if (data.googleClientId) setGoogleClientId(data.googleClientId);
      } catch (e) { /* fine, Google button just won't show */ }
    })();
  }, []);

  const handleGoogleCredential = useCallback(async (response) => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential, salt: CRYPTO_HELPERS.randomSaltB64() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Google sign-in failed."); setBusy(false); return; }
      onGoogleResult(data);
    } catch (err) {
      setError("Couldn't reach the server.");
      setBusy(false);
    }
  }, [onGoogleResult]);

  useEffect(() => {
    if (!googleClientId || !window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleCredential });
    window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: 328, text: "continue_with" });
  }, [googleClientId, handleGoogleCredential]);

  return (
    <div className="jshq min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="jshq-mono text-brass text-xs tracking-widest">MULTI-USER · END-TO-END ENCRYPTED</p>
          <h1 className="jshq-display text-2xl text-paper mt-1">Job Search HQ</h1>
          <p className="text-muted text-sm mt-1">Your data is encrypted in your browser with your password -- even the server can't read it.</p>
        </div>
        {googleClientId && (
          <div className="mb-3">
            <div ref={googleBtnRef} className="flex justify-center" />
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-hair" /><span className="text-xs text-muted">or</span><div className="flex-1 h-px bg-hair" />
            </div>
          </div>
        )}
        <form onSubmit={submit} className="bg-ink2 border border-hair rounded-lg p-5 space-y-3">
          <div className="flex gap-1 mb-2 bg-ink rounded-md p-1">
            {["login", "signup"].map((m) => (
              <button type="button" key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 text-xs font-medium py-1.5 rounded ${mode === m ? "bg-brass text-ink" : "text-muted"}`}>
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Username</label>
            <div className="flex items-center gap-2 mt-1 rounded px-3 py-2" style={{ border: "1px solid #E3DCF5", background: "#FFFFFF" }}>
              <Icon name="user" size={14} className="text-muted" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-transparent border-none flex-1 text-sm p-0 focus:shadow-none" style={{ border: "none", background: "transparent" }} placeholder="yourname" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Password</label>
            <div className="flex items-center gap-2 mt-1 rounded px-3 py-2" style={{ border: "1px solid #E3DCF5", background: "#FFFFFF" }}>
              <Icon name="lock" size={14} className="text-muted" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent flex-1 text-sm p-0" style={{ border: "none", background: "transparent" }} placeholder={mode === "signup" ? "At least 6 characters" : "********"} />
            </div>
          </div>
          {mode === "signup" && (
            <p className="text-xs text-muted flex items-start gap-1.5"><Icon name="shield" size={13} className="shrink-0 mt-0.5" /> This password also becomes your encryption key. There's no "forgot password" recovery for old data -- write it down somewhere safe.</p>
          )}
          {error && <p className="text-xs text-rust">{error}</p>}
          <button type="submit" disabled={busy || !username.trim() || !password} className="btn-primary w-full rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 focus-ring">
            {busy && <Icon name="loader" size={15} spin />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================== UNLOCK SCREEN (returning visitor) ============================== */
function UnlockScreen({ username, salt, onUnlocked, onLogout, toast }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password) return;
    setBusy(true);
    try {
      const key = await CRYPTO_HELPERS.deriveKey(password, salt);

      // Deliberately NOT using the api() helper here: we want full control to
      // report the exact failure instead of auto-clearing the session.
      const token = getToken();
      if (!token) {
        setError("No session token exists in this browser right now (it was cleared or never saved). Click 'Log out' below and log in again.");
        setBusy(false);
        return;
      }

      let res;
      try {
        res = await fetch("/api/data/jobs", { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      } catch (networkErr) {
        setError("The request could not reach the server at all (network-level failure).");
        setBusy(false);
        return;
      }

      if (res.status === 401) {
        let body = null;
        try { body = await res.json(); } catch (e2) { /* ignore */ }
        setError(`The server rejected the session: ${body && body.reason ? body.reason : "no reason given"}. Click 'Log out' below and log in again.`);
        setBusy(false);
        return;
      }
      if (!res.ok) {
        setError(`Server error (${res.status}) while checking your passphrase.`);
        setBusy(false);
        return;
      }

      let blob;
      try {
        ({ blob } = await res.json());
      } catch (parseErr) {
        setError("Unexpected response from the server -- the deployment may be out of date.");
        setBusy(false);
        return;
      }
      if (blob) {
        try {
          await CRYPTO_HELPERS.decryptJSON(key, blob);
        } catch (decryptErr) {
          setError("Incorrect passphrase.");
          setBusy(false);
          return;
        }
      }
      onUnlocked(key);
    } catch (err) {
      setError("Something went wrong unlocking your data.");
      setBusy(false);
    }
  };

  return (
    <div className="jshq min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Icon name="lock" size={22} className="text-brass mx-auto mb-2" />
          <h1 className="jshq-display text-xl text-paper">Welcome back, {username}</h1>
          <p className="text-muted text-sm mt-1">Enter your password to unlock your encrypted data on this device.</p>
        </div>
        <form onSubmit={submit} className="bg-ink2 border border-hair rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 rounded px-3 py-2" style={{ border: "1px solid #E3DCF5", background: "#FFFFFF" }}>
            <Icon name="lock" size={14} className="text-muted" />
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent flex-1 text-sm p-0" style={{ border: "none", background: "transparent" }} placeholder="********" />
          </div>
          {error && <p className="text-xs text-rust">{error}</p>}
          <button type="submit" disabled={busy || !password} className="btn-primary w-full rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 focus-ring">
            {busy && <Icon name="loader" size={15} spin />} Unlock
          </button>
          <button type="button" onClick={onLogout} className="w-full text-xs text-muted hover:text-main text-center">Not you? Log out</button>
        </form>
      </div>
    </div>
  );
}

/* ============================== SET PASSPHRASE (first Google sign-in) ============================== */
function SetPassphraseScreen({ username, salt, onSet, toast }) {
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (passphrase.length < 6) { setError("Use at least 6 characters."); return; }
    if (passphrase !== confirm) { setError("Passphrases don't match."); return; }
    setBusy(true);
    try {
      const key = await CRYPTO_HELPERS.deriveKey(passphrase, salt);
      onSet(key);
    } catch (err) {
      setError("Something went wrong setting up encryption.");
      setBusy(false);
    }
  };

  return (
    <div className="jshq min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Icon name="shield" size={22} className="text-brass mx-auto mb-2" />
          <h1 className="jshq-display text-xl text-paper">One more step, {username}</h1>
          <p className="text-muted text-sm mt-1">Set a data passphrase. It's separate from your Google account and is what encrypts your data -- Google identifies you, but only this passphrase can unlock your jobs, resume, and notes. There's no recovery if you lose it, so save it somewhere safe.</p>
        </div>
        <form onSubmit={submit} className="bg-ink2 border border-hair rounded-lg p-5 space-y-3">
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Data passphrase</label>
            <input type="password" autoFocus value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Confirm</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="Type it again" />
          </div>
          {error && <p className="text-xs text-rust">{error}</p>}
          <button type="submit" disabled={busy || !passphrase || !confirm} className="btn-primary w-full rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 focus-ring">
            {busy && <Icon name="loader" size={15} spin />} Set passphrase & continue
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============================== TRACKER TAB ============================== */
const STAGES = [
  { key: "saved", label: "Saved", num: "01" },
  { key: "applied", label: "Applied", num: "02" },
  { key: "interview", label: "Interview", num: "03" },
  { key: "offer", label: "Offer", num: "04" },
  { key: "rejected", label: "Rejected", num: "05" },
];

function AddJobModal({ onClose, onSave }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    onSave({
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      company: company.trim(), role: role.trim(), link: link.trim(), notes: notes.trim(),
      status: "saved", dateAdded: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(61,55,82,0.35)" }} onClick={onClose}>
      <form onSubmit={submit} className="fade-in bg-ink2 border border-hair rounded-lg w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="jshq-display text-lg text-paper">New application</h3>
          <button type="button" className="text-muted hover:text-main focus-ring rounded" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Company</label>
            <input ref={firstRef} value={company} onChange={(e) => setCompany(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="Product Manager" />
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Job link (optional)</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="https://..." />
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring resize-none" placeholder="Referred by...; salary range; recruiter name..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="btn-ghost rounded px-4 py-2 text-sm focus-ring" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring" disabled={!company.trim() || !role.trim()}>Add application</button>
        </div>
      </form>
    </div>
  );
}

function JobCard({ job, onStatusChange, onDelete, onDragStart, onDragEnd, dragging }) {
  return (
    <div className={`job-card rounded-md p-3 mb-3 ${dragging ? "dragging" : ""}`} draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", job.id); onDragStart(job.id); }} onDragEnd={onDragEnd}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0 jshq-mono text-paper font-medium" style={{ fontSize: 11 }}>{initials(job.company)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{job.role}</p>
          <p className="text-xs opacity-70 mt-0.5 truncate">{job.company}</p>
        </div>
        <button onClick={() => onDelete(job.id)} className="opacity-40 hover:opacity-100 hover:text-rust shrink-0" aria-label="Delete application"><Icon name="trash" size={14} /></button>
      </div>
      {job.notes && <p className="text-xs mt-2 opacity-70 line-clamp-2">{job.notes}</p>}
      <div className="flex items-center justify-between mt-3">
        <span className="jshq-mono opacity-50" style={{ fontSize: 10 }}>{job.dateAdded}</span>
        {job.link && <a href={job.link} target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100" aria-label="Open job link"><Icon name="external" size={12} /></a>}
      </div>
      <select value={job.status} onChange={(e) => onStatusChange(job.id, e.target.value)} className="w-full mt-2 rounded text-xs py-1.5 px-2 jshq-mono focus-ring" style={{ background: "#EFE7FC", color: "#3D3752", border: "1px solid #D9CDF2" }}>
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
    </div>
  );
}

function TrackerTab({ jobs, setJobs, toast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const addJob = (job) => { setJobs((prev) => [job, ...prev]); toast("success", `Added ${job.role} at ${job.company}`); };
  const deleteJob = (id) => {
    const job = jobs.find((j) => j.id === id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (job) toast("info", `Removed ${job.role} at ${job.company}`);
  };
  const changeStatus = (id, status) => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  const handleDrop = (stageKey) => { if (draggingId) changeStatus(draggingId, stageKey); setDragOverStage(null); setDraggingId(null); };

  const total = jobs.length;
  const applied = jobs.filter((j) => j.status !== "saved").length;
  const interviewing = jobs.filter((j) => j.status === "interview").length;
  const offers = jobs.filter((j) => j.status === "offer").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="jshq-display text-xl text-paper">Application pipeline</h2>
          <p className="text-muted text-sm mt-0.5">Drag cards between stages, or use the dropdown on each one.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary rounded px-4 py-2 text-sm font-medium flex items-center gap-1.5 focus-ring"><Icon name="plus" size={16} /> Add application</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard iconName="layers" label="Total applications" value={total} tone="brass" />
        <StatCard iconName="trending" label="Applied" value={applied} tone="slateblue" />
        <StatCard iconName="users" label="Interviewing" value={interviewing} tone="amberc" />
        <StatCard iconName="award" label="Offers" value={offers} tone="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageJobs = jobs.filter((j) => j.status === stage.key);
          return (
            <div key={stage.key} className={`stage-col bg-ink2 rounded-lg p-3 border border-hair ${dragOverStage === stage.key ? "drag-over" : ""}`} style={{ minHeight: 140 }}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => { e.preventDefault(); handleDrop(stage.key); }}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-hair">
                <span className="jshq-mono text-brass text-xs">{stage.num}</span>
                <span className="text-sm font-medium text-paper">{stage.label}</span>
                <span className="jshq-mono text-xs text-muted ml-auto">{stageJobs.length}</span>
              </div>
              {stageJobs.length === 0 ? <p className="text-xs text-muted italic py-4 text-center">Drop a card here</p> :
                stageJobs.map((job) => (
                  <JobCard key={job.id} job={job} onStatusChange={changeStatus} onDelete={deleteJob}
                    onDragStart={setDraggingId} onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }} dragging={draggingId === job.id} />
                ))}
            </div>
          );
        })}
      </div>
      {showAdd && <AddJobModal onClose={() => setShowAdd(false)} onSave={addJob} />}
    </div>
  );
}

/* ============================== RESUME SCANNER TAB ============================== */
function ResumeScannerTab({ resumeText, setResumeText, resumeResult, setResumeResult, toast }) {
  const [scanning, setScanning] = useState(false);
  const [ai, setAi] = useState({ status: "idle", data: null, error: null });

  const scan = () => {
    if (!resumeText.trim()) return;
    setScanning(true);
    setTimeout(() => { setResumeResult(analyzeResume(resumeText)); setScanning(false); toast("success", "Resume scanned"); }, 200);
  };

  const getAiFeedback = async () => {
    setAi({ status: "loading", data: null, error: null });
    try {
      const res = await api("/api/ai/resume-feedback", { method: "POST", body: JSON.stringify({ resumeText }) });
      const result = await res.json();
      if (result.ok) setAi({ status: "done", data: result.data, error: null });
      else { setAi({ status: "error", data: null, error: result.error }); toast("error", result.error); }
    } catch (e) {
      setAi({ status: "error", data: null, error: "Couldn't reach the server." });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="jshq-display text-xl text-paper mb-1">Resume health check</h2>
        <p className="text-muted text-sm mb-4">The instant score runs locally; AI coaching adds qualitative feedback on top.</p>
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={16} className="w-full rounded p-3 text-sm resize-none focus-ring scrollbar-thin jshq-mono" placeholder="Paste your full resume text here..." />
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={scan} disabled={!resumeText.trim() || scanning} className="btn-primary rounded px-4 py-2 text-sm font-medium flex items-center gap-2 focus-ring">
            <Icon name={scanning ? "loader" : "search"} size={16} spin={scanning} /> {scanning ? "Scanning..." : "Scan resume (instant)"}
          </button>
          <button onClick={getAiFeedback} disabled={!resumeText.trim() || ai.status === "loading"} className="btn-ai rounded px-4 py-2 text-sm font-medium flex items-center gap-2 focus-ring">
            <Icon name={ai.status === "loading" ? "loader" : "sparkles"} size={16} spin={ai.status === "loading"} className="text-brass" /> {ai.status === "loading" ? "Thinking..." : "Get AI coaching"}
          </button>
          <UploadPdfButton onExtracted={setResumeText} toast={toast} label="Upload PDF resume" />
        </div>
      </div>

      <div className="space-y-4">
        {!resumeResult ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 border border-dashed border-hair rounded-lg">
            <Icon name="search" size={28} className="text-muted mb-3" />
            <p className="text-muted text-sm" style={{ maxWidth: 260 }}>Your score and a full breakdown will appear here once you scan a resume.</p>
          </div>
        ) : (
          <div className="fade-in bg-ink2 border border-hair rounded-lg p-5">
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-hair">
              <ScoreGauge score={resumeResult.total} />
              <div>
                <p className="jshq-display text-lg text-paper">{resumeResult.total >= 75 ? "Strong shape" : resumeResult.total >= 50 ? "Needs some work" : "Needs attention"}</p>
                <p className="text-muted text-sm mt-1">{resumeResult.wordCount} words scanned</p>
              </div>
            </div>
            <div className="space-y-3">
              {resumeResult.checks.map((c) => (
                <div key={c.label} className="flex gap-2.5">
                  <div className="pt-0.5"><StatusIcon status={c.status} /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-paper">{c.label}</span>
                      <span className="jshq-mono text-xs text-muted">{c.points}/{c.max}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ai.status !== "idle" && (
          <div className="fade-in bg-ink2 border border-hair rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3"><Icon name="sparkles" size={15} className="text-brass" /><p className="text-sm font-medium text-paper">AI coach</p></div>
            {ai.status === "loading" && <AISkeleton />}
            {ai.status === "error" && <p className="text-sm text-rust">{ai.error} Your score above is unaffected.</p>}
            {ai.status === "done" && ai.data && (
              <div className="space-y-4">
                <p className="text-sm text-main">{ai.data.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs jshq-mono uppercase tracking-wide text-muted mb-2">Strengths</p>
                    <ul className="space-y-1.5">{(ai.data.strengths || []).map((s, i) => (<li key={i} className="text-xs text-main flex gap-1.5"><Icon name="check" size={13} className="text-green shrink-0 mt-0.5" />{s}</li>))}</ul>
                  </div>
                  <div>
                    <p className="text-xs jshq-mono uppercase tracking-wide text-muted mb-2">Improve</p>
                    <ul className="space-y-1.5">{(ai.data.improvements || []).map((s, i) => (<li key={i} className="text-xs text-main flex gap-1.5"><Icon name="arrowRight" size={13} className="text-amberc shrink-0 mt-0.5" />{s}</li>))}</ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== MATCH ANALYZER TAB ============================== */
function MatchAnalyzerTab({ resumeText, setResumeText, toast }) {
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [ai, setAi] = useState({ status: "idle", data: null, error: null });

  const analyze = () => {
    if (!jobDesc.trim()) return;
    setAnalyzing(true);
    setTimeout(() => { setResult(computeMatch(jobDesc, resumeText)); setAttempted(true); setAnalyzing(false); toast("success", "Match analyzed"); }, 200);
  };

  const getAiTips = async () => {
    setAi({ status: "loading", data: null, error: null });
    try {
      const res = await api("/api/ai/match-tips", { method: "POST", body: JSON.stringify({ jobDesc, resumeText }) });
      const result2 = await res.json();
      if (result2.ok) setAi({ status: "done", data: result2.data, error: null });
      else { setAi({ status: "error", data: null, error: result2.error }); toast("error", result2.error); }
    } catch (e) {
      setAi({ status: "error", data: null, error: "Couldn't reach the server." });
    }
  };

  return (
    <div>
      <h2 className="jshq-display text-xl text-paper mb-1">Job match analyzer</h2>
      <p className="text-muted text-sm mb-4">Paste a job description to see how well your resume covers its key terms.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Job description</label>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={12} className="w-full mt-1 rounded p-3 text-sm resize-none focus-ring scrollbar-thin jshq-mono" placeholder="Paste the job posting text here..." />
        </div>
        <div>
          <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Your resume</label>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={12} className="w-full mt-1 rounded p-3 text-sm resize-none focus-ring scrollbar-thin jshq-mono" placeholder="Paste your resume text here (shared with the Resume Scanner tab)..." />
          <div className="mt-2"><UploadPdfButton onExtracted={setResumeText} toast={toast} label="Upload PDF resume" /></div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={analyze} disabled={!jobDesc.trim() || analyzing} className="btn-primary rounded px-4 py-2 text-sm font-medium flex items-center gap-2 focus-ring">
          <Icon name={analyzing ? "loader" : "target"} size={16} spin={analyzing} /> {analyzing ? "Analyzing..." : "Analyze match (instant)"}
        </button>
        <button onClick={getAiTips} disabled={!jobDesc.trim() || !resumeText.trim() || ai.status === "loading"} className="btn-ai rounded px-4 py-2 text-sm font-medium flex items-center gap-2 focus-ring">
          <Icon name={ai.status === "loading" ? "loader" : "sparkles"} size={16} spin={ai.status === "loading"} className="text-brass" /> {ai.status === "loading" ? "Thinking..." : "Get AI tailoring tips"}
        </button>
      </div>

      {attempted && !analyzing && (
        result === null ? (
          <div className="fade-in mt-5 bg-ink2 border border-hair rounded-lg p-5 text-sm text-muted">Couldn't find enough distinct terms in that job description to compare. Try pasting the full posting.</div>
        ) : (
          <div className="fade-in mt-5 bg-ink2 border border-hair rounded-lg p-5">
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-hair">
              <ScoreGauge score={result.score} />
              <div>
                <p className="jshq-display text-lg text-paper">{result.matched.length} of {result.keywords.length} key terms covered</p>
                <p className="text-muted text-sm mt-1">{result.score >= 75 ? "Strong overlap with this posting." : result.score >= 45 ? "Partial overlap -- worth tailoring." : "Low overlap -- consider reworking your resume for this role."}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs jshq-mono uppercase tracking-wide text-muted mb-2">Covered</p>
                <div className="flex flex-wrap gap-1.5">{result.matched.length ? result.matched.map((k) => <Chip key={k} tone="green">{k}</Chip>) : <span className="text-xs text-muted">None yet</span>}</div>
              </div>
              <div>
                <p className="text-xs jshq-mono uppercase tracking-wide text-muted mb-2">Missing</p>
                <div className="flex flex-wrap gap-1.5">{result.missing.length ? result.missing.map((k) => <Chip key={k} tone="rust">{k}</Chip>) : <span className="text-xs text-muted">None -- full coverage</span>}</div>
              </div>
            </div>
          </div>
        )
      )}

      {ai.status !== "idle" && (
        <div className="fade-in mt-4 bg-ink2 border border-hair rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3"><Icon name="sparkles" size={15} className="text-brass" /><p className="text-sm font-medium text-paper">AI tailoring tips</p></div>
          {ai.status === "loading" && <AISkeleton />}
          {ai.status === "error" && <p className="text-sm text-rust">{ai.error} Your match score above is unaffected.</p>}
          {ai.status === "done" && ai.data && (
            <div className="space-y-3">
              <p className="text-sm text-main">{ai.data.summary}</p>
              <ul className="space-y-1.5">{(ai.data.tips || []).map((t, i) => (<li key={i} className="text-xs text-main flex gap-1.5"><Icon name="arrowRight" size={13} className="text-brass shrink-0 mt-0.5" />{t}</li>))}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================== INTERVIEW PREP: CHECKLIST SUB-TAB ============================== */
const CHECKLIST_ITEMS = [
  { id: "research", label: "Research the company & role" },
  { id: "questions", label: "Prepare questions to ask the interviewer" },
  { id: "stories", label: "Practice STAR stories for key experiences" },
  { id: "logistics", label: "Confirm date, time, and format" },
  { id: "attire", label: "Plan outfit / test tech setup" },
  { id: "thankyou", label: "Send a thank-you note after" },
];

function InterviewChecklistSubTab({ jobs, interviewData, setInterviewData }) {
  const [selectedId, setSelectedId] = useState(jobs[0]?.id || "");
  useEffect(() => { if (!selectedId && jobs.length) setSelectedId(jobs[0].id); }, [jobs, selectedId]);
  const current = interviewData[selectedId] || { checklist: {}, notes: "" };

  const toggleItem = (itemId) => {
    setInterviewData((prev) => ({ ...prev, [selectedId]: { checklist: { ...(prev[selectedId]?.checklist || {}), [itemId]: !(prev[selectedId]?.checklist?.[itemId]) }, notes: prev[selectedId]?.notes || "" } }));
  };
  const updateNotes = (notes) => { setInterviewData((prev) => ({ ...prev, [selectedId]: { checklist: prev[selectedId]?.checklist || {}, notes } })); };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center border border-dashed border-hair rounded-lg" style={{ height: 260 }}>
        <Icon name="clipboard" size={28} className="text-muted mb-3" />
        <p className="text-muted text-sm" style={{ maxWidth: 260 }}>Add an application in the Pipeline tab first, then prep for it here.</p>
      </div>
    );
  }

  const doneCount = CHECKLIST_ITEMS.filter((i) => current.checklist[i.id]).length;

  return (
    <div>
      <h2 className="jshq-display text-lg text-paper mb-1">Application checklist</h2>
      <p className="text-muted text-sm mb-4">Pick an application and work through the checklist.</p>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded px-3 py-2 text-sm mb-5 focus-ring">
        {jobs.map((j) => <option key={j.id} value={j.id}>{j.role} -- {j.company}</option>)}
      </select>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink2 border border-hair rounded-lg p-5">
          <div className="flex items-center justify-between mb-4"><p className="text-sm font-medium text-paper">Checklist</p><span className="jshq-mono text-xs text-muted">{doneCount}/{CHECKLIST_ITEMS.length}</span></div>
          <div className="w-full bg-ink3 rounded-full h-1.5 mb-4 overflow-hidden"><div className="bg-brass h-full rounded-full" style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%`, transition: "width .3s ease" }} /></div>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={!!current.checklist[item.id]} onChange={() => toggleItem(item.id)} style={{ width: 16, height: 16, accentColor: "#B9A0EA" }} />
                <span className={`text-sm ${current.checklist[item.id] ? "text-muted line-through" : "text-main"}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="bg-ink2 border border-hair rounded-lg p-5">
          <p className="text-sm font-medium text-paper mb-3">Notes</p>
          <textarea value={current.notes} onChange={(e) => updateNotes(e.target.value)} rows={10} className="w-full rounded p-3 text-sm resize-none focus-ring scrollbar-thin" placeholder="Interviewer names, questions they asked, things to follow up on..." />
        </div>
      </div>
    </div>
  );
}

/* ============================== INTERVIEW PREP: LEARNING SUB-TAB ============================== */
function genId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function LearningSubTab({ learning, setLearning, toast }) {
  const [roleInput, setRoleInput] = useState(learning.targetRole || "");
  const [ai, setAi] = useState({ status: "idle", error: null });
  const [manualTopic, setManualTopic] = useState("");
  const [manualCert, setManualCert] = useState({ name: "", issuer: "", note: "" });
  const [completingId, setCompletingId] = useState(null);
  const [completeForm, setCompleteForm] = useState({ dateCompleted: "", link: "" });

  useEffect(() => { setRoleInput(learning.targetRole || ""); }, [learning.targetRole]);

  const getSuggestions = async () => {
    const role = roleInput.trim();
    if (!role) return;
    setAi({ status: "loading", error: null });
    try {
      const res = await api("/api/ai/learning-suggestions", { method: "POST", body: JSON.stringify({ role }) });
      const result = await res.json();
      if (!result.ok) { setAi({ status: "error", error: result.error }); toast("error", result.error); return; }
      setAi({ status: "idle", error: null });
      setLearning((prev) => {
        const existingTopicLabels = new Set(prev.topics.map((t) => t.label.toLowerCase()));
        const newTopics = (result.data.topics || [])
          .filter((label) => label && !existingTopicLabels.has(String(label).toLowerCase()))
          .map((label) => ({ id: genId("topic"), label, done: false, source: "ai" }));
        const existingCertNames = new Set(prev.certifications.map((c) => c.name.toLowerCase()));
        const newCerts = (result.data.certifications || [])
          .filter((c) => c && c.name && !existingCertNames.has(String(c.name).toLowerCase()))
          .map((c) => ({ id: genId("cert"), name: c.name, issuer: c.provider || "", note: c.note || "", status: "suggested", dateCompleted: "", link: "" }));
        return {
          ...prev,
          targetRole: role,
          summary: result.data.summary || prev.summary,
          topics: [...prev.topics, ...newTopics],
          certifications: [...prev.certifications, ...newCerts],
        };
      });
      toast("success", "Added new study suggestions");
    } catch (e) {
      setAi({ status: "error", error: "Couldn't reach the server." });
    }
  };

  const toggleTopic = (id) => setLearning((prev) => ({ ...prev, topics: prev.topics.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  const deleteTopic = (id) => setLearning((prev) => ({ ...prev, topics: prev.topics.filter((t) => t.id !== id) }));
  const addManualTopic = () => {
    const label = manualTopic.trim();
    if (!label) return;
    setLearning((prev) => ({ ...prev, topics: [...prev.topics, { id: genId("topic"), label, done: false, source: "manual" }] }));
    setManualTopic("");
  };

  const deleteCert = (id) => setLearning((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  const addManualCert = () => {
    if (!manualCert.name.trim()) return;
    setLearning((prev) => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: genId("cert"), name: manualCert.name.trim(), issuer: manualCert.issuer.trim(),
        note: manualCert.note.trim(), status: "suggested", dateCompleted: "", link: "",
      }],
    }));
    setManualCert({ name: "", issuer: "", note: "" });
  };

  const startComplete = (cert) => { setCompletingId(cert.id); setCompleteForm({ dateCompleted: new Date().toISOString().slice(0, 10), link: cert.link || "" }); };
  const cancelComplete = () => setCompletingId(null);
  const confirmComplete = (id) => {
    setLearning((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, status: "completed", dateCompleted: completeForm.dateCompleted, link: completeForm.link.trim() } : c)),
    }));
    setCompletingId(null);
    toast("success", "Nice work -- certification marked complete");
  };
  const unmarkComplete = (id) => setLearning((prev) => ({ ...prev, certifications: prev.certifications.map((c) => (c.id === id ? { ...c, status: "suggested" } : c)) }));

  const topicsDone = learning.topics.filter((t) => t.done).length;
  const topicsTotal = learning.topics.length;
  const progressPct = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
  const toPursue = learning.certifications.filter((c) => c.status !== "completed");
  const completedCerts = learning.certifications.filter((c) => c.status === "completed");

  return (
    <div>
      <h2 className="jshq-display text-lg text-paper mb-1">Stay current & get certified</h2>
      <p className="text-muted text-sm mb-4">Tell it the role or field you're in, and get study topics and certification ideas -- then track your progress.</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input value={roleInput} onChange={(e) => setRoleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && getSuggestions()} className="flex-1 rounded px-3 py-2 text-sm focus-ring" placeholder="e.g. Marketing Manager, Growth Marketing, B2B SaaS Marketing" />
        <button onClick={getSuggestions} disabled={!roleInput.trim() || ai.status === "loading"} className="btn-ai rounded px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 focus-ring shrink-0">
          <Icon name={ai.status === "loading" ? "loader" : "sparkles"} size={16} spin={ai.status === "loading"} className="text-brass" /> {ai.status === "loading" ? "Thinking..." : "Get suggestions"}
        </button>
      </div>
      {ai.status === "error" && <p className="text-xs text-rust mb-3">{ai.error}</p>}
      {learning.summary && <p className="text-sm text-main bg-ink2 border border-hair rounded-lg p-3 mb-5">{learning.summary}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard iconName="book" label="Topics to study" value={topicsTotal} tone="brass" />
        <StatCard iconName="check" label="Topics studied" value={topicsDone} tone="green" />
        <StatCard iconName="trending" label="Progress" value={`${progressPct}%`} tone="amberc" />
        <StatCard iconName="award" label="Certifications earned" value={completedCerts.length} tone="slateblue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-ink2 border border-hair rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-paper">Study topics</p>
            <span className="jshq-mono text-xs text-muted">{topicsDone}/{topicsTotal}</span>
          </div>
          <div className="w-full bg-ink3 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="bg-brass h-full rounded-full" style={{ width: `${progressPct}%`, transition: "width .3s ease" }} />
          </div>
          {topicsTotal === 0 ? (
            <p className="text-xs text-muted italic mb-3">No topics yet -- get AI suggestions above or add your own.</p>
          ) : (
            <div className="space-y-2.5 mb-4 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {learning.topics.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 group">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTopic(t.id)} style={{ width: 16, height: 16, accentColor: "#B9A0EA" }} />
                  <span className={`text-sm flex-1 ${t.done ? "text-muted line-through" : "text-main"}`}>{t.label}</span>
                  {t.source === "ai" && <Icon name="sparkles" size={11} className="text-brass shrink-0" />}
                  <button onClick={() => deleteTopic(t.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-rust shrink-0" aria-label="Remove topic"><Icon name="x" size={13} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addManualTopic()} className="flex-1 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Add your own topic..." />
            <button onClick={addManualTopic} disabled={!manualTopic.trim()} className="btn-ghost rounded px-3 py-1.5 text-sm focus-ring shrink-0"><Icon name="plus" size={15} /></button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-ink2 border border-hair rounded-lg p-5">
            <p className="text-sm font-medium text-paper mb-3">Certifications to pursue</p>
            {toPursue.length === 0 ? (
              <p className="text-xs text-muted italic mb-3">Nothing on your list yet.</p>
            ) : (
              <div className="space-y-2.5 mb-4">
                {toPursue.map((c) => (
                  <div key={c.id} className="border border-hair rounded-md p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-paper truncate">{c.name}</p>
                        {c.issuer && <p className="text-xs text-muted mt-0.5">{c.issuer}</p>}
                        {c.note && <p className="text-xs text-muted mt-1">{c.note}</p>}
                      </div>
                      <button onClick={() => deleteCert(c.id)} className="text-muted hover:text-rust shrink-0" aria-label="Remove certification"><Icon name="x" size={13} /></button>
                    </div>
                    {completingId === c.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); confirmComplete(c.id); }} className="mt-3 pt-3 border-t border-hair space-y-2">
                        <div>
                          <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Date completed</label>
                          <input type="date" value={completeForm.dateCompleted} onChange={(e) => setCompleteForm((f) => ({ ...f, dateCompleted: e.target.value }))} className="w-full mt-1 rounded px-2.5 py-1.5 text-xs focus-ring" />
                        </div>
                        <div>
                          <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Credential link (optional)</label>
                          <input value={completeForm.link} onChange={(e) => setCompleteForm((f) => ({ ...f, link: e.target.value }))} className="w-full mt-1 rounded px-2.5 py-1.5 text-xs focus-ring" placeholder="https://..." />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="submit" className="btn-primary rounded px-3 py-1.5 text-xs font-medium focus-ring">Confirm</button>
                          <button type="button" onClick={cancelComplete} className="btn-ghost rounded px-3 py-1.5 text-xs focus-ring">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => startComplete(c)} className="mt-2.5 text-xs text-brass hover:underline flex items-center gap-1"><Icon name="check" size={12} /> Mark as completed</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); if (manualCert.name.trim()) addManualCert(); }} className="pt-3 border-t border-hair space-y-2">
              <input value={manualCert.name} onChange={(e) => setManualCert((f) => ({ ...f, name: e.target.value }))} className="w-full rounded px-3 py-1.5 text-sm focus-ring" placeholder="Certification name" />
              <div className="flex gap-2">
                <input value={manualCert.issuer} onChange={(e) => setManualCert((f) => ({ ...f, issuer: e.target.value }))} className="flex-1 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Issuer (optional)" />
                <button type="submit" disabled={!manualCert.name.trim()} className="btn-ghost rounded px-3 py-1.5 text-sm focus-ring shrink-0"><Icon name="plus" size={15} /></button>
              </div>
            </form>
          </div>

          <div className="bg-ink2 border border-hair rounded-lg p-5">
            <p className="text-sm font-medium text-paper mb-3 flex items-center gap-1.5"><Icon name="award" size={15} className="text-green" /> Completed certifications</p>
            {completedCerts.length === 0 ? (
              <p className="text-xs text-muted italic">None yet -- they'll show up here once you mark one complete.</p>
            ) : (
              <div className="space-y-2.5">
                {completedCerts.map((c) => (
                  <div key={c.id} className="border border-hair rounded-md p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-paper truncate">{c.name}</p>
                      <p className="text-xs text-muted mt-0.5">{c.issuer ? `${c.issuer} \u00b7 ` : ""}{c.dateCompleted}</p>
                      {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-brass hover:underline flex items-center gap-1 mt-1"><Icon name="external" size={11} /> Credential link</a>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => unmarkComplete(c.id)} className="text-xs text-muted hover:text-main">Undo</button>
                      <button onClick={() => deleteCert(c.id)} className="text-muted hover:text-rust" aria-label="Remove certification"><Icon name="x" size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== INTERVIEW PREP SECTION (wraps both sub-tabs) ============================== */
const PREP_SUBTABS = [
  { key: "checklist", label: "Prep Checklist", icon: "clipboard" },
  { key: "learning", label: "Learning & Certs", icon: "book" },
];

function InterviewPrepSection({ jobs, interviewData, setInterviewData, learning, setLearning, toast }) {
  const [subTab, setSubTab] = useState("checklist");
  return (
    <div>
      <div className="flex gap-1 mb-5 bg-ink2 rounded-md p-1 w-fit border border-hair">
        {PREP_SUBTABS.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} className={`text-xs font-medium py-1.5 px-3 rounded flex items-center gap-1.5 ${subTab === t.key ? "bg-brass text-ink" : "text-muted"}`}>
            <Icon name={t.icon} size={13} /> {t.label}
          </button>
        ))}
      </div>
      {subTab === "checklist" ? (
        <InterviewChecklistSubTab jobs={jobs} interviewData={interviewData} setInterviewData={setInterviewData} />
      ) : (
        <LearningSubTab learning={learning} setLearning={setLearning} toast={toast} />
      )}
    </div>
  );
}

/* ============================== PROFILE TAB ============================== */
function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ProfileTab({ username, jobs, resumeText, resumeResult, learning, profile, setProfile, documents, setDocuments, encryptionKey, toast }) {
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setHeadline(profile.headline); setBio(profile.bio); }, [profile.headline, profile.bio]);

  const saveEdits = (e) => {
    if (e) e.preventDefault();
    setProfile((p) => ({ ...p, headline: headline.trim(), bio: bio.trim() }));
    setEditing(false);
  };

  const addSkill = (e) => {
    if (e) e.preventDefault();
    const s = skillInput.trim();
    if (!s) return;
    if (!profile.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setProfile((p) => ({ ...p, skills: [...p.skills, s] }));
    }
    setSkillInput("");
  };
  const removeSkill = (s) => setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));

  const stageCounts = STAGES.map((s) => ({ ...s, count: jobs.filter((j) => j.status === s.key).length }));
  const completedCerts = (learning.certifications || []).filter((c) => c.status === "completed");

  // Merges extracted info into the profile without discarding anything the
  // person already typed in manually -- headline/bio only fill if currently
  // empty, skills are added on top of (never replacing) the existing list.
  const applyExtractedProfile = (guessed) => {
    setProfile((p) => {
      const mergedSkills = [...p.skills];
      for (const s of guessed.skills || []) {
        if (!mergedSkills.some((x) => x.toLowerCase() === s.toLowerCase())) mergedSkills.push(s);
      }
      return {
        ...p,
        headline: p.headline || guessed.headline || p.headline,
        bio: p.bio || guessed.bio || p.bio,
        skills: mergedSkills,
      };
    });
  };

  const autofillFromText = async (text) => {
    setAutofilling(true);
    try {
      // Local heuristic always runs first -- free, instant, no AI needed.
      applyExtractedProfile(guessProfileFromResume(text));

      // Optional AI enhancement on top, if configured -- silently skipped
      // (local result stands) if no ANTHROPIC_API_KEY is set on the deployment.
      try {
        const res = await api("/api/ai/profile-suggestions", { method: "POST", body: JSON.stringify({ resumeText: text }) });
        const result = await res.json();
        if (result.ok && result.data) applyExtractedProfile(result.data);
      } catch (e) { /* local heuristic result already applied, fine to skip AI */ }

      toast("success", "Profile updated from your resume.");
    } catch (err) {
      toast("error", "Couldn't read that resume.");
    }
    setAutofilling(false);
  };

  const autofillFromUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { toast("error", "Only PDF files are supported."); return; }
    setAutofilling(true);
    try {
      const buf = await file.arrayBuffer();
      const text = await extractPdfText(buf);
      await autofillFromText(text);
    } catch (err) {
      toast("error", err.message || "Couldn't read that PDF.");
      setAutofilling(false);
    }
  };

  const decryptDocToBuffer = async (doc) => {
    const res = await fetch(doc.url);
    if (!res.ok) throw new Error("Couldn't fetch the file.");
    const buf = await res.arrayBuffer();
    const dataB64 = bufToB64(new Uint8Array(buf));
    return CRYPTO_HELPERS.decryptBytes(encryptionKey, doc.ivB64, dataB64);
  };

  const autofillFromLatestDocument = async () => {
    const pdfDocs = documents.filter((d) => d.name.toLowerCase().endsWith(".pdf"));
    if (pdfDocs.length === 0) { toast("error", "No uploaded PDFs to use yet."); return; }
    const latest = [...pdfDocs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    setAutofilling(true);
    try {
      const plainBuf = await decryptDocToBuffer(latest);
      const text = await extractPdfText(plainBuf);
      await autofillFromText(text);
    } catch (err) {
      toast("error", "Couldn't read that document.");
      setAutofilling(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { toast("error", "Only PDF files are supported right now."); return; }
    if (file.size > 4 * 1024 * 1024) { toast("error", "Keep files under 4MB."); return; }

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { ivB64, dataB64 } = await CRYPTO_HELPERS.encryptBytes(encryptionKey, arrayBuffer);
      const res = await api("/api/documents/upload", { method: "POST", body: JSON.stringify({ dataB64 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDocuments((docs) => [...docs, {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name, sizeBytes: file.size, url: data.url, pathname: data.pathname,
        ivB64, uploadedAt: new Date().toISOString(),
      }]);
      toast("success", "File uploaded.");
    } catch (err) {
      toast("error", err.message || "Couldn't upload that file.");
    }
    setUploading(false);
  };

  const handleDownload = async (doc) => {
    try {
      const plainBuf = await decryptDocToBuffer(doc);
      const blobUrl = URL.createObjectURL(new Blob([plainBuf], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = blobUrl; a.download = doc.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      toast("error", "Couldn't decrypt that file.");
    }
  };

  const handleDelete = async (doc) => {
    try {
      await api("/api/documents/delete", { method: "POST", body: JSON.stringify({ pathname: doc.pathname }) });
      setDocuments((docs) => docs.filter((d) => d.id !== doc.id));
      toast("info", "File removed.");
    } catch (err) {
      toast("error", "Couldn't remove that file.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-xs text-muted flex items-start gap-1.5"><Icon name="sparkles" size={13} className="shrink-0 mt-0.5 text-brass" /> Fill headline, bio, and skills automatically from a resume. Never overwrites what you've already typed -- only fills empty fields and adds new skills on top.</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {resumeText && resumeText.trim() && (
            <button onClick={() => autofillFromText(resumeText)} disabled={autofilling} className="btn-ghost rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 focus-ring">
              {autofilling ? <Icon name="loader" size={13} spin /> : <Icon name="clipboard" size={13} />} Use Resume Scanner text
            </button>
          )}
          {documents.some((d) => d.name.toLowerCase().endsWith(".pdf")) && (
            <button onClick={autofillFromLatestDocument} disabled={autofilling} className="btn-ghost rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 focus-ring">
              {autofilling ? <Icon name="loader" size={13} spin /> : <Icon name="clipboard" size={13} />} Use latest uploaded PDF
            </button>
          )}
          <label className="btn-ghost rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 focus-ring cursor-pointer">
            {autofilling ? <Icon name="loader" size={13} spin /> : <Icon name="plus" size={13} />} Upload a resume PDF
            <input type="file" accept="application/pdf" onChange={autofillFromUpload} className="hidden" disabled={autofilling} />
          </label>
        </div>
        <div className="flex items-start gap-4 pt-4 border-t border-hair">
          <div className="w-14 h-14 rounded-full bg-ink3 flex items-center justify-center jshq-mono text-paper text-lg shrink-0">{initials(username)}</div>
          <div className="min-w-0 flex-1">
            <h3 className="jshq-display text-lg text-paper">{username}</h3>
            {!editing ? (
              <>
                <p className="text-sm text-main mt-0.5">{profile.headline || <span className="text-muted italic">No headline yet -- add what role you're targeting.</span>}</p>
                {profile.bio && <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{profile.bio}</p>}
                <button onClick={() => setEditing(true)} className="text-xs text-brass hover:underline mt-2.5">Edit profile</button>
              </>
            ) : (
              <form onSubmit={saveEdits} className="space-y-2 mt-1">
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded px-3 py-1.5 text-sm focus-ring" placeholder="e.g. B2B SaaS Marketing Manager" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded px-3 py-1.5 text-sm focus-ring resize-none" placeholder="A short summary about your background and what you're looking for..." />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary rounded px-3 py-1.5 text-xs font-medium focus-ring">Save</button>
                  <button type="button" onClick={() => { setEditing(false); setHeadline(profile.headline); setBio(profile.bio); }} className="btn-ghost rounded px-3 py-1.5 text-xs focus-ring">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-hair">
          <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {profile.skills.length === 0 && <p className="text-xs text-muted italic">No skills added yet.</p>}
            {profile.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 text-xs bg-ink3 text-paper rounded-full px-2.5 py-1">
                {s} <button onClick={() => removeSkill(s)} className="text-muted hover:text-rust" aria-label={`Remove ${s}`}><Icon name="x" size={11} /></button>
              </span>
            ))}
          </div>
          <form onSubmit={addSkill} className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="flex-1 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Add a skill and press Enter" />
            <button type="submit" disabled={!skillInput.trim()} className="btn-ghost rounded px-3 py-1.5 text-sm focus-ring"><Icon name="plus" size={15} /></button>
          </form>
        </div>
      </div>

      {/* Stats rollup */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {stageCounts.map((s) => (
          <div key={s.key} className="bg-ink2 border border-hair rounded-lg p-3 text-center">
            <p className="jshq-display text-xl text-paper">{s.count}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Certifications rollup, mirrors Learning & Certs data */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <p className="text-sm font-medium text-paper mb-3 flex items-center gap-1.5"><Icon name="award" size={15} className="text-green" /> Licenses & certifications</p>
        {completedCerts.length === 0 ? (
          <p className="text-xs text-muted italic">None yet -- mark certifications complete in Interview Prep → Learning & Certs and they'll show up here.</p>
        ) : (
          <div className="space-y-2">
            {completedCerts.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-2 border-b border-hair pb-2 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm text-paper truncate">{c.name}</p>
                  <p className="text-xs text-muted">{[c.issuer, c.dateCompleted].filter(Boolean).join(" · ")}</p>
                </div>
                {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-brass hover:underline shrink-0 flex items-center gap-1">View <Icon name="external" size={11} /></a>}
              </div>
            ))}
          </div>
        )}
        {resumeResult && (
          <p className="text-xs text-muted mt-3 pt-3 border-t border-hair">Latest resume scan score: <span className="text-paper font-medium">{resumeResult.score}/100</span></p>
        )}
      </div>

      {/* Documents */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-paper">Documents</p>
          <label className="btn-ghost rounded px-3 py-1.5 text-xs focus-ring cursor-pointer flex items-center gap-1.5">
            {uploading ? <Icon name="loader" size={13} spin /> : <Icon name="plus" size={13} />} Upload PDF
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        <p className="text-xs text-muted mb-3">Store a copy of your resume, transcripts, or certificates. Files are encrypted in your browser before upload -- up to 4MB each.</p>
        {documents.length === 0 ? (
          <p className="text-xs text-muted italic">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 border border-hair rounded-md px-3 py-2">
                <div className="min-w-0 flex items-center gap-2">
                  <Icon name="clipboard" size={14} className="text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-paper truncate">{doc.name}</p>
                    <p className="text-xs text-muted">{fmtBytes(doc.sizeBytes)} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleDownload(doc)} className="text-xs text-brass hover:underline">Download</button>
                  <button onClick={() => handleDelete(doc)} className="text-muted hover:text-rust" aria-label="Delete file"><Icon name="trash" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== APP SHELL ============================== */
const TABS = [
  { key: "tracker", label: "Pipeline", icon: "briefcase" },
  { key: "scanner", label: "Resume Scanner", icon: "search" },
  { key: "match", label: "Match Analyzer", icon: "target" },
  { key: "prep", label: "Interview Prep", icon: "clipboard" },
  { key: "profile", label: "Profile", icon: "user" },
];

const DEFAULT_LEARNING = { targetRole: "", topics: [], certifications: [], summary: "" };
const DEFAULT_PROFILE = { headline: "", bio: "", skills: [] };

function MainApp({ username, encryptionKey, onLogout, toast }) {
  const [activeTab, setActiveTab] = useState("tracker");
  const [loaded, setLoaded] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [resumeResult, setResumeResult] = useState(null);
  const [interviewData, setInterviewData] = useState({});
  const [learning, setLearning] = useState(DEFAULT_LEARNING);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, resumeRes, interviewsRes, learningRes, profileRes, documentsRes] = await Promise.all([
          api("/api/data/jobs"), api("/api/data/resume"), api("/api/data/interviews"), api("/api/data/learning"), api("/api/data/profile"), api("/api/data/documents"),
        ]);
        const jobsBlob = (await jobsRes.json()).blob;
        const resumeBlob = (await resumeRes.json()).blob;
        const interviewsBlob = (await interviewsRes.json()).blob;
        const learningBlob = (await learningRes.json()).blob;
        const profileBlob = (await profileRes.json()).blob;
        const documentsBlob = (await documentsRes.json()).blob;

        const jobsData = jobsBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, jobsBlob) : [];
        const resumeData = resumeBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, resumeBlob) : { text: "", result: null };
        const interviewsData = interviewsBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, interviewsBlob) : {};
        const learningData = learningBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, learningBlob) : DEFAULT_LEARNING;
        const profileData = profileBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, profileBlob) : DEFAULT_PROFILE;
        const documentsData = documentsBlob ? await CRYPTO_HELPERS.decryptJSON(encryptionKey, documentsBlob) : [];

        setJobs(jobsData || []);
        setResumeText((resumeData && resumeData.text) || "");
        setResumeResult((resumeData && resumeData.result) || null);
        setInterviewData(interviewsData || {});
        setLearning({ ...DEFAULT_LEARNING, ...(learningData || {}) });
        setProfile({ ...DEFAULT_PROFILE, ...(profileData || {}) });
        setDocuments(documentsData || []);
      } catch (e) {
        toast("error", "Couldn't load or decrypt your saved data.");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, jobs);
        await api("/api/data/jobs", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [jobs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, { text: resumeText, result: resumeResult });
        await api("/api/data/resume", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [resumeText, resumeResult, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, interviewData);
        await api("/api/data/interviews", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [interviewData, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, learning);
        await api("/api/data/learning", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [learning, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, profile);
        await api("/api/data/profile", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [profile, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = await CRYPTO_HELPERS.encryptJSON(encryptionKey, documents);
        await api("/api/data/documents", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [documents, loaded]);

  const activeMeta = TABS.find((t) => t.key === activeTab);

  return (
    <div className="jshq min-h-screen w-full flex flex-col sm:flex-row">
      <aside className="hidden sm:flex flex-col bg-ink2 border-r border-hair p-4" style={{ width: 224, flexShrink: 0 }}>
        <div className="mb-6 px-2">
          <p className="jshq-mono text-brass tracking-widest" style={{ fontSize: 10 }}>ENCRYPTED · MULTI-USER</p>
          <h1 className="jshq-display text-lg text-paper leading-tight mt-0.5">Job Search HQ</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => (
            <button key={t.key} data-active={activeTab === t.key} onClick={() => setActiveTab(t.key)} className="nav-item rounded-md px-3 py-2.5 text-sm font-medium flex items-center gap-2.5 text-left focus-ring">
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 px-2 border-t border-hair">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-ink3 flex items-center justify-center jshq-mono text-paper" style={{ fontSize: 10 }}>{initials(username)}</div>
            <span className="text-xs text-main truncate">{username}</span>
          </div>
          <button onClick={onLogout} className="text-xs text-muted hover:text-rust flex items-center gap-1.5"><Icon name="logout" size={13} /> Log out</button>
        </div>
      </aside>

      <div className="sm:hidden bg-ink2 border-b border-hair px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="jshq-mono text-brass tracking-widest" style={{ fontSize: 10 }}>ENCRYPTED · MULTI-USER</p>
            <h1 className="jshq-display text-lg text-paper leading-tight">Job Search HQ</h1>
          </div>
          <button onClick={onLogout} className="text-muted hover:text-rust"><Icon name="logout" size={16} /></button>
        </div>
        <nav className="flex gap-1 mt-3 overflow-x-auto scrollbar-thin -mx-1 px-1">
          {TABS.map((t) => (
            <button key={t.key} data-active={activeTab === t.key} onClick={() => setActiveTab(t.key)} className="nav-item rounded-md px-3 py-2 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap focus-ring">
              <Icon name={t.icon} size={14} /> {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-4 sm:p-8" style={{ maxWidth: 1000 }}>
        <div className="mb-5 hidden sm:block"><h2 className="jshq-display text-xl text-paper">{activeMeta.label}</h2></div>
        {!loaded ? (
          <div className="space-y-3"><div className="skeleton h-8" style={{ width: "33%" }} /><div className="skeleton h-24 w-full" /><div className="skeleton h-24 w-full" /></div>
        ) : (
          <div key={activeTab} className="fade-in">
            {activeTab === "tracker" && <TrackerTab jobs={jobs} setJobs={setJobs} toast={toast} />}
            {activeTab === "scanner" && <ResumeScannerTab resumeText={resumeText} setResumeText={setResumeText} resumeResult={resumeResult} setResumeResult={setResumeResult} toast={toast} />}
            {activeTab === "match" && <MatchAnalyzerTab resumeText={resumeText} setResumeText={setResumeText} toast={toast} />}
            {activeTab === "prep" && <InterviewPrepSection jobs={jobs} interviewData={interviewData} setInterviewData={setInterviewData} learning={learning} setLearning={setLearning} toast={toast} />}
            {activeTab === "profile" && <ProfileTab username={username} jobs={jobs} resumeText={resumeText} resumeResult={resumeResult} learning={learning} profile={profile} setProfile={setProfile} documents={documents} setDocuments={setDocuments} encryptionKey={encryptionKey} toast={toast} />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================== ROOT ============================== */
function Root() {
  const [phase, setPhase] = useState("checking");
  const [username, setUsername] = useState(null);
  const [salt, setSalt] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setPhase("loggedOut"); return; }
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setSalt(data.salt);
          setPhase("locked");
        } else {
          clearSession();
          setPhase("loggedOut");
        }
      } catch (e) {
        setPhase("loggedOut");
      }
    })();
  }, []);

  const handleAuthed = (uname, key) => { setUsername(uname); setEncryptionKey(key); setPhase("unlocked"); };
  const handleUnlocked = (key) => { setEncryptionKey(key); setPhase("unlocked"); };
  const handleGoogleResult = (data) => {
    setUsername(data.username);
    setSalt(data.salt);
    if (data.isNewUser) {
      setPhase("setPassphrase");
    } else {
      setPhase("locked"); // existing account -- reuse the normal unlock flow to re-derive the key
    }
  };
  const handlePassphraseSet = (key) => { setEncryptionKey(key); setPhase("unlocked"); };
  const handleLogout = () => {
    clearSession();
    setUsername(null); setSalt(null); setEncryptionKey(null);
    setPhase("loggedOut");
    toast("info", "Logged out");
  };

  if (phase === "checking") {
    return <div className="jshq min-h-screen flex items-center justify-center"><Icon name="loader" size={20} spin /></div>;
  }

  return (
    <>
      {phase === "loggedOut" && <AuthScreen onAuthed={handleAuthed} onGoogleResult={handleGoogleResult} toast={toast} />}
      {phase === "locked" && <UnlockScreen username={username} salt={salt} onUnlocked={handleUnlocked} onLogout={handleLogout} toast={toast} />}
      {phase === "setPassphrase" && <SetPassphraseScreen username={username} salt={salt} onSet={handlePassphraseSet} toast={toast} />}
      {phase === "unlocked" && <MainApp username={username} encryptionKey={encryptionKey} onLogout={handleLogout} toast={toast} />}
      <ToastStack toasts={toasts} remove={removeToast} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
