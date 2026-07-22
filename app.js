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
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
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

// (Client-side encryption was removed by request -- data is protected by
// account auth on the server instead.)

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
    // Rebuild real line breaks from each text item's Y position on the page,
    // so bullets/sections survive extraction (important for scoring + autofill).
    const lines = [];
    let line = [];
    let lastY = null;
    for (const it of content.items) {
      const y = Math.round((it.transform && it.transform[5]) || 0);
      if (lastY !== null && Math.abs(y - lastY) > 2 && line.length) {
        lines.push(line.join(" "));
        line = [];
      }
      if (it.str && it.str.trim()) line.push(it.str.trim());
      lastY = y;
    }
    if (line.length) lines.push(line.join(" "));
    text += lines.join("\n") + "\n";
  }
  return text.trim();
}
// sessionStorage (not localStorage) on purpose: the login only lasts for the
// current browser session/tab. Closing the browser ends it, so every new
// session starts at the login screen. Refreshing within a session stays in.
const getToken = () => sessionStorage.getItem(TOKEN_KEY);
const setToken = (t) => sessionStorage.setItem(TOKEN_KEY, t);
const clearSession = () => sessionStorage.removeItem(TOKEN_KEY);

// Parses a stored blob string back to data. Blobs saved by the old
// encrypted version of this app can't be read anymore -- they're detected by
// shape and treated as empty so the app starts cleanly instead of crashing.
function parseBlob(blob, fallback) {
  if (blob === null || blob === undefined || blob === "") return fallback;
  let v = blob;
  if (typeof blob === "string") {
    try { v = JSON.parse(blob); } catch (e) { return fallback; }
  }
  // Legacy encrypted-era blobs ({iv, data}) are unreadable -> treat as empty.
  if (v && typeof v === "object" && typeof v.iv === "string" && typeof v.data === "string") return fallback;
  return v === null || v === undefined ? fallback : v;
}

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
  for (const rawLine of lines.slice(0, 8)) {
    // Take the part before any "|" (contact separators), skip all-caps lines
    // (usually the person's name) and anything with emails/phones.
    const cand = rawLine.split("|")[0].trim();
    if (!cand || cand.length < 4 || cand.length > 70) continue;
    if (/[@]/.test(cand) || /\d{3}.*\d{4}/.test(cand)) continue;
    if (cand === cand.toUpperCase() && /[A-Z]{3}/.test(cand)) continue;
    const wc = cand.split(/\s+/).length;
    if (wc >= 2 && wc <= 8) { headline = cand; break; }
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

  // ---- Section-based parsing for experience / education / certifications ----
  const HEADING_RE = /^(professional experience|work experience|experience|employment( history)?|education|certifications?|licenses?( & certifications?)?|skills|technical skills|projects|summary|objective|profile)\b/i;
  const sectionOf = (h) => {
    const t = h.toLowerCase();
    if (/certif|licen/.test(t)) return "certs";
    if (/education/.test(t)) return "education";
    if (/experience|employment/.test(t)) return "experience";
    return "other";
  };
  const sections = { experience: [], education: [], certs: [] };
  let current = "other";
  for (const line of lines) {
    const stripped = line.replace(/[:\s]+$/, "");
    if (stripped.length <= 40 && HEADING_RE.test(stripped)) { current = sectionOf(stripped); continue; }
    if (sections[current]) sections[current].push(line);
  }

  const DATE_RE = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{4})\s*[-–—to]+\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{4}|present|current)/i;

  const experience = [];
  for (const line of sections.experience) {
    const m = line.match(DATE_RE);
    if (m && !/^[-•*▪◦]/.test(line)) {
      const dates = m[0];
      const rest = line.replace(m[0], "").replace(/[|,–—-]+\s*$/, "").replace(/^\s*[|,–—-]+/, "").trim();
      const parts = rest.split(/\s*[|·]\s*/).map((s) => s.trim()).filter(Boolean);
      experience.push({ title: parts[0] || rest || "Role", company: parts[1] || "", dates });
      if (experience.length >= 6) break;
    }
  }

  const DEGREE_RE = /\b(bachelor|master|b\.?s\.?c?|m\.?s\.?c?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|ph\.?d|mba|associate|diploma)\b/i;
  const education = [];
  const eduSource = sections.education.length ? sections.education : lines;
  for (let i = 0; i < eduSource.length; i++) {
    const line = eduSource[i];
    if (DEGREE_RE.test(line)) {
      const dm = line.match(DATE_RE) || line.match(/\b(19|20)\d{2}\b/);
      const school = /universit|college|institute|school/i.test(line) ? "" : ((eduSource[i + 1] && /universit|college|institute|school/i.test(eduSource[i + 1])) ? eduSource[i + 1].split(/\s*[|·]\s*/)[0].trim() : "");
      education.push({ degree: line.replace(DATE_RE, "").replace(/[|,–—-]+\s*$/, "").trim().slice(0, 90), school: school.slice(0, 70), dates: dm ? dm[0] : "" });
      if (education.length >= 4) break;
    }
  }

  const certifications = [];
  for (const line of sections.certs) {
    const name = line.replace(/^[-•*▪◦\s]+/, "").trim();
    if (name && name.length >= 4 && name.length <= 110) {
      certifications.push({ name: name.slice(0, 100), issuer: "" });
      if (certifications.length >= 8) break;
    }
  }

  return { headline, bio, skills, experience, education, certifications };
}

function analyzeResume(text) {
  const clean = (text || "").trim();
  if (!clean) return null;
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);
  let bulletLines = lines.filter((l) => /^[-•*▪◦]|^\d+[.)]/.test(l));
  // Fallback: some resumes (or PDF extractions) keep bullets inline on one
  // line -- treat text between bullet characters as individual bullets.
  if (bulletLines.length < 3) {
    const inline = clean.split(/[•▪◦]/).slice(1).map((s) => s.trim())
      .filter((s) => { const w = s.split(/\s+/).length; return w >= 3 && w <= 60; });
    if (inline.length >= 3) bulletLines = inline;
  }
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

function Avatar({ avatar, username, size = 56, fontSize }) {
  return (
    <div className="rounded-full flex items-center justify-center jshq-mono avatar-grad shrink-0"
      style={{ width: size, height: size, fontSize: fontSize || (avatar ? size * 0.55 : size * 0.34) }}>
      {avatar || initials(username)}
    </div>
  );
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Job Search HQ logo">
      <defs>
        <linearGradient id="jshqlg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B9A0EA" /><stop offset="1" stopColor="#8C93B8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#jshqlg)" />
      {/* briefcase */}
      <rect x="14" y="26" width="36" height="22" rx="4" fill="#FFFFFF" />
      <path d="M26 26 v-4 a3 3 0 0 1 3-3 h6 a3 3 0 0 1 3 3 v4" fill="none" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="14" y="34" width="36" height="2.6" fill="#B9A0EA" opacity="0.55" />
      {/* upward arrow = career trajectory */}
      <path d="M22 44 L31 37 L36 40.5 L43 32" fill="none" stroke="#8C6FD1" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M43 32 l-6 0.8 M43 32 l-0.8 6" fill="none" stroke="#8C6FD1" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
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
  const [signupEmail, setSignupEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);
  const googleBtnRef = useRef(null);

  const requestReset = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError("Enter your username first."); return; }
    setError(""); setInfo(""); setBusy(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      setInfo(data.message || "If that account has an email on file, a reset link has been sent.");
      setForgotMode(false);
    } catch (err) {
      setError("Couldn't reach the server.");
    }
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) return;
    setBusy(true);
    try {
      const body = { username: username.trim(), password };
      if (mode === "signup" && signupEmail.trim()) body.email = signupEmail.trim();

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setBusy(false); return; }

      setToken(data.token);
      toast("success", mode === "signup" ? `Welcome, ${data.username}!` : `Welcome back, ${data.username}!`);
      onAuthed(data.username);
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
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Google sign-in failed."); setBusy(false); return; }
      if (data.pending) {
        setInfo(data.message || "Account request sent -- awaiting admin approval.");
        setBusy(false);
        return;
      }
      if (!data.token) { setError("Sign-in failed -- no session token returned."); setBusy(false); return; }
      setToken(data.token);
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
          <p className="jshq-mono text-brass text-xs tracking-widest">YOUR JOB SEARCH COMMAND CENTER</p>
          <h1 className="jshq-display text-2xl text-paper mt-1">Job Search HQ</h1>
          <p className="text-muted text-sm mt-1">Your entire job search -- pipeline, resume tools, interview prep, and learning -- in one private account.</p>
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
            <div>
              <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Email (optional, for password reset)</label>
              <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="you@example.com" />
            </div>
          )}
          {error && <p className="text-xs text-rust">{error}</p>}
          {info && <p className="text-xs text-green">{info}</p>}
          <button type="submit" disabled={busy || !username.trim() || !password} className="btn-primary w-full rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 focus-ring">
            {busy && <Icon name="loader" size={15} spin />}
            {mode === "login" ? "Log in" : "Create account"}
          </button>
          {mode === "login" && !forgotMode && (
            <button type="button" onClick={() => { setForgotMode(true); setInfo(""); setError(""); }} className="w-full text-xs text-muted hover:text-main text-center">Forgot your password?</button>
          )}
          {forgotMode && (
            <div className="pt-2 border-t border-hair space-y-2">
              <p className="text-xs text-muted">Enter your username above, and if your account has an email on file (Google accounts do automatically; others can add one in Profile → Account), you'll get a reset link.</p>
              <div className="flex gap-2">
                <button type="button" onClick={requestReset} disabled={busy || !username.trim()} className="btn-ghost rounded px-3 py-1.5 text-xs focus-ring flex-1">Send reset link</button>
                <button type="button" onClick={() => setForgotMode(false)} className="text-xs text-muted hover:text-main px-2">Cancel</button>
              </div>
            </div>
          )}
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

function JobModal({ onClose, onSave, initial }) {
  const editing = !!initial;
  const [company, setCompany] = useState(initial ? initial.company : "");
  const [role, setRole] = useState(initial ? initial.role : "");
  const [link, setLink] = useState(initial ? initial.link || "" : "");
  const [deadline, setDeadline] = useState(initial ? initial.deadline || "" : "");
  const [notes, setNotes] = useState(initial ? initial.notes || "" : "");
  const [jobDesc, setJobDesc] = useState(initial ? initial.jobDesc || "" : "");
  const firstRef = useRef(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    if (editing) {
      onSave({ ...initial, company: company.trim(), role: role.trim(), link: link.trim(), deadline, notes: notes.trim(), jobDesc: jobDesc.trim() });
    } else {
      onSave({
        id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        company: company.trim(), role: role.trim(), link: link.trim(), deadline, notes: notes.trim(), jobDesc: jobDesc.trim(),
        status: "saved", dateAdded: new Date().toISOString().slice(0, 10),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(61,55,82,0.35)" }} onClick={onClose}>
      <form onSubmit={submit} className="fade-in bg-ink2 border border-hair rounded-lg w-full max-w-md p-5 max-h-full overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="jshq-display text-lg text-paper">{editing ? "Edit application" : "New application"}</h3>
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
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Job link (optional)</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Job description (optional)</label>
            <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring resize-none scrollbar-thin" placeholder="Paste the job description here to enable one-click match analysis from the card..." />
          </div>
          <div>
            <label className="text-xs text-muted jshq-mono uppercase tracking-wide">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full mt-1 rounded px-3 py-2 text-sm focus-ring resize-none" placeholder="Referred by...; salary range; recruiter name..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" className="btn-ghost rounded px-4 py-2 text-sm focus-ring" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring" disabled={!company.trim() || !role.trim()}>{editing ? "Save changes" : "Add application"}</button>
        </div>
      </form>
    </div>
  );
}

function deadlineInfo(deadline) {
  if (!deadline) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(deadline + "T00:00:00");
  const days = Math.round((d - today) / 86400000);
  if (days < 0) return { label: `Overdue ${-days}d`, tone: "overdue", days };
  if (days === 0) return { label: "Due today", tone: "soon", days };
  if (days <= 7) return { label: `Due in ${days}d`, tone: "soon", days };
  return { label: `Due ${deadline}`, tone: "ok", days };
}

function JobCard({ job, onStatusChange, onDelete, onEdit, onMatch, onDragStart, onDragEnd, dragging }) {
  const dl = deadlineInfo(job.deadline);
  const dlStyle = dl && (dl.tone === "overdue"
    ? { background: "#FBE3DE", color: "#C25A44", border: "1px solid #F3C9C0" }
    : dl.tone === "soon"
      ? { background: "#F7EDD8", color: "#A87F2D", border: "1px solid #EBD9B4" }
      : { background: "#EFE7FC", color: "#6E5BA6", border: "1px solid #D9CDF2" });
  return (
    <div className={`job-card rounded-md p-3 mb-3 ${dragging ? "dragging" : ""}`} draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", job.id); onDragStart(job.id); }} onDragEnd={onDragEnd}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shrink-0 jshq-mono text-paper font-medium" style={{ fontSize: 11 }}>{initials(job.company)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{job.role}</p>
          <p className="text-xs opacity-70 mt-0.5 truncate">{job.company}</p>
        </div>
        <button onClick={() => onEdit(job)} className="opacity-40 hover:opacity-100 shrink-0" aria-label="Edit application"><Icon name="edit" size={13} /></button>
        <button onClick={() => onDelete(job.id)} className="opacity-40 hover:opacity-100 hover:text-rust shrink-0" aria-label="Delete application"><Icon name="trash" size={14} /></button>
      </div>
      {dl && <span className="inline-block rounded-full mt-2 jshq-mono" style={{ ...dlStyle, fontSize: 10, padding: "2px 8px" }}>{dl.label}</span>}
      {job.notes && <p className="text-xs mt-2 opacity-70 line-clamp-2">{job.notes}</p>}
      <div className="flex items-center justify-between mt-3">
        <span className="jshq-mono opacity-50" style={{ fontSize: 10 }}>{job.dateAdded}</span>
        <span className="flex items-center gap-2">
          {job.jobDesc && <button onClick={() => onMatch(job)} className="opacity-60 hover:opacity-100 text-xs font-medium flex items-center gap-1" title="Analyze match against your resume"><Icon name="target" size={12} /> Match</button>}
          {job.link && <a href={job.link} target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-100" aria-label="Open job link"><Icon name="external" size={12} /></a>}
        </span>
      </div>
      <select value={job.status} onChange={(e) => onStatusChange(job.id, e.target.value)} className="w-full mt-2 rounded text-xs py-1.5 px-2 jshq-mono focus-ring" style={{ background: "#EFE7FC", color: "#3D3752", border: "1px solid #D9CDF2" }}>
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
    </div>
  );
}

function TrackerTab({ jobs, setJobs, onMatchJob, toast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const addJob = (job) => { setJobs((prev) => [job, ...prev]); toast("success", `Added ${job.role} at ${job.company}`); };
  const updateJob = (job) => { setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j))); toast("success", "Application updated"); };
  const deleteJob = (id) => {
    const job = jobs.find((j) => j.id === id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (job) toast("info", `Removed ${job.role} at ${job.company}`);
  };
  const changeStatus = (id, status) => setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  const handleDrop = (stageKey) => { if (draggingId) changeStatus(draggingId, stageKey); setDragOverStage(null); setDraggingId(null); };

  const q = search.trim().toLowerCase();
  const visibleJobs = q
    ? jobs.filter((j) => [j.company, j.role, j.notes, j.link].some((f) => (f || "").toLowerCase().includes(q)))
    : jobs;

  // Upcoming/overdue deadlines on still-active applications
  const reminders = jobs
    .filter((j) => j.deadline && j.status !== "rejected" && j.status !== "offer")
    .map((j) => ({ job: j, dl: deadlineInfo(j.deadline) }))
    .filter((r) => r.dl && r.dl.days <= 7)
    .sort((a, b) => a.dl.days - b.dl.days);

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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded px-3 py-2" style={{ border: "1px solid #E3DCF5", background: "#FFFFFF" }}>
            <Icon name="search" size={14} className="text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm p-0 w-40" style={{ border: "none", background: "transparent" }} placeholder="Search cards..." />
            {search && <button onClick={() => setSearch("")} className="text-muted hover:text-main"><Icon name="x" size={13} /></button>}
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary rounded px-4 py-2 text-sm font-medium flex items-center gap-1.5 focus-ring"><Icon name="plus" size={16} /> Add application</button>
        </div>
      </div>

      {reminders.length > 0 && (
        <div className="rounded-lg p-3.5 mb-5" style={{ background: "#FDF6EA", border: "1px solid #EBD9B4" }}>
          <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "#A87F2D" }}><Icon name="calendar" size={13} /> Deadlines coming up</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {reminders.map(({ job, dl }) => (
              <button key={job.id} onClick={() => setEditingJob(job)} className="text-xs hover:underline" style={{ color: dl.tone === "overdue" ? "#C25A44" : "#8A6A24" }}>
                {job.role} at {job.company} -- {dl.label.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard iconName="layers" label="Total applications" value={total} tone="brass" />
        <StatCard iconName="trending" label="Applied" value={applied} tone="slateblue" />
        <StatCard iconName="users" label="Interviewing" value={interviewing} tone="amberc" />
        <StatCard iconName="award" label="Offers" value={offers} tone="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage) => {
          const stageJobs = visibleJobs.filter((j) => j.status === stage.key);
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
                  <JobCard key={job.id} job={job} onStatusChange={changeStatus} onDelete={deleteJob} onEdit={setEditingJob} onMatch={onMatchJob}
                    onDragStart={setDraggingId} onDragEnd={() => { setDraggingId(null); setDragOverStage(null); }} dragging={draggingId === job.id} />
                ))}
            </div>
          );
        })}
      </div>
      {showAdd && <JobModal onClose={() => setShowAdd(false)} onSave={addJob} />}
      {editingJob && <JobModal initial={editingJob} onClose={() => setEditingJob(null)} onSave={updateJob} />}
    </div>
  );
}

/* ============================== RESUME SCANNER TAB ============================== */
function ResumeScannerTab({ resumeText, setResumeText, resumeResult, setResumeResult, versions, activeId, onSelectVersion, onCreateVersion, onRenameVersion, onDeleteVersion, toast }) {
  const [scanning, setScanning] = useState(false);
  const [ai, setAi] = useState({ status: "idle", data: null, error: null });
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState("");
  const safeVersions = Array.isArray(versions) && versions.length ? versions : [{ id: "v_default", name: "Main resume", text: "", result: null }];
  const activeVersion = safeVersions.find((v) => v.id === activeId) || safeVersions[0];

  const versionBar = (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <select value={activeVersion.id} onChange={(e) => { setAi({ status: "idle", data: null, error: null }); onSelectVersion(e.target.value); }} className="rounded text-sm py-1.5 px-2.5 focus-ring" style={{ maxWidth: 220 }}>
        {safeVersions.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
      {renaming ? (
        <form onSubmit={(e) => { e.preventDefault(); if (renameVal.trim()) onRenameVersion(activeVersion.id, renameVal.trim()); setRenaming(false); }} className="flex gap-1.5">
          <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} className="rounded px-2.5 py-1.5 text-sm focus-ring" placeholder="New name" style={{ width: 160 }} />
          <button type="submit" className="btn-ghost rounded px-2.5 py-1.5 text-xs focus-ring">Save</button>
        </form>
      ) : (
        <button onClick={() => { setRenameVal(activeVersion.name); setRenaming(true); }} className="btn-ghost rounded px-2.5 py-1.5 text-xs focus-ring">Rename</button>
      )}
      <button onClick={() => onCreateVersion(`Version ${safeVersions.length + 1}`)} className="btn-ghost rounded px-2.5 py-1.5 text-xs focus-ring flex items-center gap-1"><Icon name="plus" size={12} /> New version</button>
      {safeVersions.length > 1 && (
        <button onClick={() => { if (window.confirm(`Delete "${activeVersion.name}"? Its text and score are removed.`)) onDeleteVersion(activeVersion.id); }} className="rounded px-2.5 py-1.5 text-xs focus-ring" style={{ border: "1px solid #F3C9C0", color: "#D97862" }}>Delete</button>
      )}
      <span className="text-xs text-muted">Keep tailored versions per role -- each has its own text and score.</span>
    </div>
  );

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
        <p className="text-muted text-sm mb-4">The instant score is a local heuristic -- every ATS tool scores differently, so treat it as directional, not absolute. AI coaching adds qualitative feedback on top.</p>
        {versionBar}
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
function MatchAnalyzerTab({ resumeText, setResumeText, prefill, toast }) {
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [ai, setAi] = useState({ status: "idle", data: null, error: null });

  // When a pipeline card's "Match" button sends its job description here,
  // load it in and run the local analysis immediately.
  useEffect(() => {
    if (prefill && prefill.jobDesc) {
      setJobDesc(prefill.jobDesc);
      setResult(computeMatch(prefill.jobDesc, resumeText));
      setAttempted(true);
      setAi({ status: "idle", data: null, error: null });
    }
  }, [prefill]);

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

/* ============================== TO-DOS TAB ============================== */
function TodoList({ title, caption, items, onAdd, onToggle, onRemove, onClearDone }) {
  const [input, setInput] = useState("");
  const doneCount = items.filter((t) => t.done).length;
  return (
    <div className="bg-ink2 border border-hair rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-paper">{title}</p>
        <span className="jshq-mono text-xs text-muted">{doneCount}/{items.length} done</span>
      </div>
      <p className="text-xs text-muted mb-3">{caption}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { onAdd(input.trim()); setInput(""); } }} className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded px-3 py-2 text-sm focus-ring" placeholder="Add a task and press Enter" />
        <button type="submit" disabled={!input.trim()} className="btn-ghost rounded px-3 py-2 text-sm focus-ring"><Icon name="plus" size={15} /></button>
      </form>
      {items.length === 0 ? (
        <p className="text-xs text-muted italic">Nothing here yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 group">
              <input type="checkbox" checked={!!t.done} onChange={() => onToggle(t.id)} style={{ width: 16, height: 16, accentColor: "#B9A0EA" }} />
              <span className={`text-sm flex-1 ${t.done ? "text-muted line-through" : "text-main"}`}>{t.text}</span>
              <button onClick={() => onRemove(t.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-rust" aria-label="Remove task"><Icon name="x" size={13} /></button>
            </div>
          ))}
        </div>
      )}
      {doneCount > 0 && <button onClick={onClearDone} className="text-xs text-muted hover:text-main mt-3">Clear completed</button>}
    </div>
  );
}

function TodosTab({ todos, setTodos, toast }) {
  const makeOps = (listKey) => ({
    onAdd: (text) => setTodos((p) => ({ ...p, [listKey]: [...p[listKey], { id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text, done: false }] })),
    onToggle: (id) => setTodos((p) => ({ ...p, [listKey]: p[listKey].map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
    onRemove: (id) => setTodos((p) => ({ ...p, [listKey]: p[listKey].filter((t) => t.id !== id) })),
    onClearDone: () => setTodos((p) => ({ ...p, [listKey]: p[listKey].filter((t) => !t.done) })),
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="jshq-display text-xl text-paper">To-do lists</h2>
        <p className="text-muted text-sm mt-0.5">Pending items are included in your single morning reminder email (if you have an email set in Profile → Account).</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TodoList title="Today" caption="Check-offs reset automatically each morning -- the tasks stay, ready for a fresh day." items={todos.daily} {...makeOps("daily")} />
        <TodoList title="This week" caption="Check-offs reset automatically every Monday." items={todos.weekly} {...makeOps("weekly")} />
      </div>
    </div>
  );
}

/* ============================== CONTACTS TAB ============================== */
function ContactsTab({ contacts, setContacts, toast }) {
  const [form, setForm] = useState({ name: "", company: "", role: "", link: "", notes: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const addContact = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setContacts((prev) => [{
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(), company: form.company.trim(), role: form.role.trim(),
      link: form.link.trim(), notes: form.notes.trim(), lastContacted: "",
    }, ...prev]);
    setForm({ name: "", company: "", role: "", link: "", notes: "" });
    toast("success", "Contact added.");
  };

  const update = (id, patch) => setContacts((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id) => { setContacts((prev) => prev.filter((x) => x.id !== id)); toast("info", "Contact removed."); };
  const markContacted = (id) => update(id, { lastContacted: new Date().toISOString().slice(0, 10) });

  const q = search.trim().toLowerCase();
  const visible = q ? contacts.filter((x) => [x.name, x.company, x.role, x.notes].some((f) => (f || "").toLowerCase().includes(q))) : contacts;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="jshq-display text-xl text-paper">Networking contacts</h2>
          <p className="text-muted text-sm mt-0.5">Recruiters, referrals, and people worth following up with.</p>
        </div>
        <div className="flex items-center gap-2 rounded px-3 py-2" style={{ border: "1px solid #E3DCF5", background: "#FFFFFF" }}>
          <Icon name="search" size={14} className="text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm p-0 w-40" style={{ border: "none", background: "transparent" }} placeholder="Search contacts..." />
          {search && <button onClick={() => setSearch("")} className="text-muted hover:text-main"><Icon name="x" size={13} /></button>}
        </div>
      </div>

      <form onSubmit={addContact} className="bg-ink2 border border-hair rounded-lg p-4 mb-5">
        <div className="flex flex-wrap gap-2">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="flex-1 min-w-36 rounded px-3 py-2 text-sm focus-ring" placeholder="Name *" />
          <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-2 text-sm focus-ring" placeholder="Company" />
          <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-2 text-sm focus-ring" placeholder="Role (e.g. Recruiter)" />
          <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className="flex-1 min-w-40 rounded px-3 py-2 text-sm focus-ring" placeholder="Email or LinkedIn URL" />
          <button type="submit" disabled={!form.name.trim()} className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring">Add</button>
        </div>
        <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full mt-2 rounded px-3 py-2 text-sm focus-ring" placeholder="Notes (how you met, what they said, next step...)" />
      </form>

      {visible.length === 0 ? (
        <p className="text-sm text-muted italic text-center py-8">{contacts.length === 0 ? "No contacts yet -- add recruiters and referrals above." : "No contacts match your search."}</p>
      ) : (
        <div className="space-y-2.5">
          {visible.map((x) => (
            <div key={x.id} className="bg-ink2 border border-hair rounded-lg p-4">
              {editingId === x.id ? (
                <form onSubmit={(e) => { e.preventDefault(); setEditingId(null); toast("success", "Contact updated."); }} className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input value={x.name} onChange={(e) => update(x.id, { name: e.target.value })} className="flex-1 min-w-32 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Name" />
                    <input value={x.company} onChange={(e) => update(x.id, { company: e.target.value })} className="flex-1 min-w-28 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Company" />
                    <input value={x.role} onChange={(e) => update(x.id, { role: e.target.value })} className="flex-1 min-w-28 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Role" />
                    <input value={x.link} onChange={(e) => update(x.id, { link: e.target.value })} className="flex-1 min-w-36 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Email or LinkedIn" />
                  </div>
                  <input value={x.notes} onChange={(e) => update(x.id, { notes: e.target.value })} className="w-full rounded px-3 py-1.5 text-sm focus-ring" placeholder="Notes" />
                  <button type="submit" className="btn-primary rounded px-3 py-1.5 text-xs font-medium focus-ring">Done</button>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-paper">{x.name}{(x.role || x.company) && <span className="text-muted font-normal"> · {[x.role, x.company].filter(Boolean).join(" at ")}</span>}</p>
                    {x.notes && <p className="text-xs text-muted mt-1">{x.notes}</p>}
                    <p className="text-xs text-muted mt-1.5 jshq-mono" style={{ fontSize: 11 }}>
                      {x.lastContacted ? `Last contacted ${x.lastContacted}` : "Never contacted"}
                      {x.link && <> · {/@/.test(x.link) && !/^https?:/.test(x.link)
                        ? <a href={`mailto:${x.link}`} className="text-brass hover:underline">{x.link}</a>
                        : <a href={/^https?:/.test(x.link) ? x.link : `https://${x.link}`} target="_blank" rel="noreferrer" className="text-brass hover:underline">profile</a>}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => markContacted(x.id)} className="btn-ghost rounded px-2.5 py-1.5 text-xs focus-ring" title="Mark contacted today">Contacted today</button>
                    <button onClick={() => setEditingId(x.id)} className="text-muted hover:text-main" aria-label="Edit"><Icon name="edit" size={14} /></button>
                    <button onClick={() => remove(x.id)} className="text-muted hover:text-rust" aria-label="Delete"><Icon name="trash" size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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

function AccountSection({ username, jobs, contacts, todos, resumeVersions, resumeText, resumeResult, interviewData, learning, profile, documents, onLogout, toast }) {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [emailVal, setEmailVal] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/auth/me");
        const data = await res.json();
        if (res.ok) { setCurrentEmail(data.email || null); setEmailVal(data.email || ""); }
      } catch (e) { /* fine */ }
    })();
  }, []);

  const saveEmail = async (e) => {
    e.preventDefault();
    setEmailBusy(true);
    try {
      const res = await api("/api/auth/set-email", { method: "POST", body: JSON.stringify({ email: emailVal.trim() }) });
      const data = await res.json();
      if (!res.ok) toast("error", data.error || "Couldn't save email.");
      else { setCurrentEmail(data.email); toast("success", data.email ? "Email saved." : "Email removed."); }
    } catch (err) { toast("error", "Couldn't reach the server."); }
    setEmailBusy(false);
  };
  const [pwBusy, setPwBusy] = useState(false);
  const [delConfirm, setDelConfirm] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next.length < 6) { toast("error", "New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { toast("error", "New passwords don't match."); return; }
    setPwBusy(true);
    try {
      const res = await api("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }) });
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Couldn't change password."); }
      else { toast("success", data.message || "Password updated."); setPwForm({ current: "", next: "", confirm: "" }); }
    } catch (err) {
      toast("error", "Couldn't reach the server.");
    }
    setPwBusy(false);
  };

  const download = (filename, text, type) => {
    const blobUrl = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = blobUrl; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  };

  const exportJSON = () => {
    const data = { exportedAt: new Date().toISOString(), username, jobs, contacts, todos, resume: { versions: resumeVersions }, interviews: interviewData, learning, profile, documents };
    download(`job-search-hq-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
    toast("success", "Exported all data as JSON.");
  };

  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Company", "Role", "Status", "Date added", "Deadline", "Link", "Notes"].join(",")];
    for (const j of jobs) rows.push([j.company, j.role, j.status, j.dateAdded, j.deadline || "", j.link || "", j.notes || ""].map(esc).join(","));
    download(`applications-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\n"), "text/csv");
    toast("success", "Exported applications as CSV.");
  };

  const deleteAccount = async () => {
    if (delConfirm !== username) { toast("error", "Type your username exactly to confirm."); return; }
    setDelBusy(true);
    try {
      const res = await api("/api/auth/delete-account", { method: "POST", body: JSON.stringify({ confirm: delConfirm }) });
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Couldn't delete the account."); setDelBusy(false); return; }
      clearSession();
      window.location.reload();
    } catch (err) {
      toast("error", "Couldn't reach the server.");
      setDelBusy(false);
    }
  };

  return (
    <div className="bg-ink2 border border-hair rounded-lg p-5 space-y-5">
      <p className="text-sm font-medium text-paper flex items-center gap-1.5"><Icon name="user" size={15} className="text-brass" /> Account</p>

      <div>
        <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Email (for password reset & deadline reminders)</p>
        <form onSubmit={saveEmail} className="flex flex-wrap gap-2">
          <input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} className="flex-1 min-w-48 rounded px-3 py-2 text-sm focus-ring" placeholder="you@example.com" />
          <button type="submit" disabled={emailBusy} className="btn-ghost rounded px-4 py-2 text-sm focus-ring">{emailBusy ? "Saving..." : "Save email"}</button>
        </form>
        <p className="text-xs text-muted mt-1.5">{currentEmail ? `Reset links and daily deadline reminder emails go to ${currentEmail}.` : "No email on file -- without one, a forgotten password can't be reset and deadline reminder emails can't be sent. (Google sign-in accounts get their email automatically.)"} Emails only work if the deployment has BREVO_API_KEY configured.</p>
      </div>

      <div className="pt-4 border-t border-hair">
        <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Change password</p>
        <form onSubmit={changePassword} className="flex flex-wrap gap-2 items-end">
          <input type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} className="flex-1 min-w-36 rounded px-3 py-2 text-sm focus-ring" placeholder="Current password (blank if Google-only)" />
          <input type="password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-2 text-sm focus-ring" placeholder="New password" />
          <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-2 text-sm focus-ring" placeholder="Confirm new" />
          <button type="submit" disabled={pwBusy || !pwForm.next || !pwForm.confirm} className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring">{pwBusy ? "Saving..." : "Update"}</button>
        </form>
        <p className="text-xs text-muted mt-1.5">Google sign-in accounts can set a password here (leave "current" blank) to also enable username login. There's no email-based reset -- if a password is forgotten while logged out, the account can't be recovered.</p>
      </div>

      <div className="pt-4 border-t border-hair">
        <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Export my data</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJSON} className="btn-ghost rounded px-3 py-2 text-sm focus-ring flex items-center gap-1.5"><Icon name="download" size={14} /> Everything (JSON)</button>
          <button onClick={exportCSV} className="btn-ghost rounded px-3 py-2 text-sm focus-ring flex items-center gap-1.5"><Icon name="download" size={14} /> Applications (CSV)</button>
        </div>
      </div>

      <div className="pt-4 border-t border-hair">
        <p className="text-xs jshq-mono uppercase tracking-wide mb-2 text-rust">Danger zone</p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="rounded px-3 py-2 text-sm focus-ring" style={{ border: "1px solid #F3C9C0", color: "#D97862" }}>Delete my account...</button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-rust">This permanently deletes your account, all saved data, and uploaded files. It cannot be undone. Consider exporting first.</p>
            <div className="flex flex-wrap gap-2">
              <input value={delConfirm} onChange={(e) => setDelConfirm(e.target.value)} className="flex-1 min-w-40 rounded px-3 py-2 text-sm focus-ring" placeholder={`Type "${username}" to confirm`} />
              <button onClick={deleteAccount} disabled={delBusy || delConfirm !== username} className="rounded px-3 py-2 text-sm font-medium focus-ring" style={{ background: delConfirm === username ? "#D97862" : "#F3C9C0", color: "#FFFFFF" }}>{delBusy ? "Deleting..." : "Delete forever"}</button>
              <button onClick={() => { setShowDelete(false); setDelConfirm(""); }} className="btn-ghost rounded px-3 py-2 text-sm focus-ring">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileTab({ username, jobs, contacts, todos, resumeVersions, resumeText, resumeResult, interviewData, learning, profile, setProfile, documents, setDocuments, onLogout, toast }) {
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [expForm, setExpForm] = useState({ title: "", company: "", dates: "" });
  const [eduForm, setEduForm] = useState({ degree: "", school: "", dates: "" });
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
      const mergeList = (existing, incoming, keyOf) => {
        const out = [...(existing || [])];
        for (const item of incoming || []) {
          const k = keyOf(item).toLowerCase().trim();
          if (k && !out.some((x) => keyOf(x).toLowerCase().trim() === k)) out.push(item);
        }
        return out;
      };
      return {
        ...p,
        headline: p.headline || guessed.headline || p.headline,
        bio: p.bio || guessed.bio || p.bio,
        skills: mergedSkills,
        experience: mergeList(p.experience, guessed.experience, (x) => `${x.title || ""}@${x.company || ""}`),
        education: mergeList(p.education, guessed.education, (x) => x.degree || ""),
        certifications: mergeList(p.certifications, guessed.certifications, (x) => x.name || ""),
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

  const fetchDocBuffer = async (doc) => {
    if (doc.ivB64) throw new Error("This file was uploaded by an older version of the app and can't be opened -- delete and re-upload it.");
    const res = await fetch(doc.url);
    if (!res.ok) throw new Error("Couldn't fetch the file.");
    return res.arrayBuffer();
  };

  const autofillFromLatestDocument = async () => {
    const pdfDocs = documents.filter((d) => d.name.toLowerCase().endsWith(".pdf"));
    if (pdfDocs.length === 0) { toast("error", "No uploaded PDFs to use yet."); return; }
    const latest = [...pdfDocs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    setAutofilling(true);
    try {
      const plainBuf = await fetchDocBuffer(latest);
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
      const dataB64 = bufToB64(new Uint8Array(arrayBuffer));
      const res = await api("/api/documents/upload", { method: "POST", body: JSON.stringify({ dataB64 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDocuments((docs) => [...docs, {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name, sizeBytes: file.size, url: data.url, pathname: data.pathname,
        uploadedAt: new Date().toISOString(),
      }]);
      toast("success", "File uploaded.");
    } catch (err) {
      toast("error", err.message || "Couldn't upload that file.");
    }
    setUploading(false);
  };

  const handleDownload = async (doc) => {
    try {
      const plainBuf = await fetchDocBuffer(doc);
      const blobUrl = URL.createObjectURL(new Blob([plainBuf], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = blobUrl; a.download = doc.name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      toast("error", err.message || "Couldn't open that file.");
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
          <div className="shrink-0">
            <button type="button" onClick={() => setShowAvatarPicker((v) => !v)} className="focus-ring rounded-full" title="Change avatar">
              <Avatar avatar={profile.avatar} username={username} size={56} />
            </button>
            {showAvatarPicker && (
              <div className="absolute z-20 mt-2 bg-ink2 border border-hair rounded-lg p-3 shadow-lg" style={{ maxWidth: 232 }}>
                <p className="text-xs text-muted mb-2">Pick an avatar</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_CHOICES.map((a) => (
                    <button key={a} type="button" onClick={() => { setProfile((p) => ({ ...p, avatar: a })); setShowAvatarPicker(false); }}
                      className="w-9 h-9 rounded-md flex items-center justify-center text-xl hover:bg-ink3 focus-ring">{a}</button>
                  ))}
                </div>
                <button type="button" onClick={() => { setProfile((p) => ({ ...p, avatar: "" })); setShowAvatarPicker(false); }}
                  className="text-xs text-muted hover:text-main mt-2">Use my initials instead</button>
              </div>
            )}
          </div>
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

      {/* Experience */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <p className="text-sm font-medium text-paper mb-3 flex items-center gap-1.5"><Icon name="briefcase" size={15} className="text-brass" /> Experience</p>
        {(profile.experience || []).length === 0 && <p className="text-xs text-muted italic mb-2">Nothing yet -- autofill from a resume above, or add below.</p>}
        <div className="space-y-2 mb-3">
          {(profile.experience || []).map((x, i) => (
            <div key={i} className="flex items-start justify-between gap-2 border-b border-hair pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm text-paper">{x.title}{x.company ? <span className="text-muted"> · {x.company}</span> : null}</p>
                {x.dates && <p className="text-xs text-muted">{x.dates}</p>}
              </div>
              <button onClick={() => setProfile((p) => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))} className="text-muted hover:text-rust shrink-0" aria-label="Remove"><Icon name="x" size={13} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!expForm.title.trim()) return; setProfile((p) => ({ ...p, experience: [...(p.experience || []), { title: expForm.title.trim(), company: expForm.company.trim(), dates: expForm.dates.trim() }] })); setExpForm({ title: "", company: "", dates: "" }); }} className="flex flex-wrap gap-2">
          <input value={expForm.title} onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Title" />
          <input value={expForm.company} onChange={(e) => setExpForm((f) => ({ ...f, company: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Company" />
          <input value={expForm.dates} onChange={(e) => setExpForm((f) => ({ ...f, dates: e.target.value }))} className="w-36 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Jan 2025 - Present" />
          <button type="submit" disabled={!expForm.title.trim()} className="btn-ghost rounded px-3 py-1.5 text-sm focus-ring"><Icon name="plus" size={15} /></button>
        </form>
      </div>

      {/* Education */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <p className="text-sm font-medium text-paper mb-3 flex items-center gap-1.5"><Icon name="clipboard" size={15} className="text-brass" /> Education</p>
        {(profile.education || []).length === 0 && <p className="text-xs text-muted italic mb-2">Nothing yet -- autofill from a resume above, or add below.</p>}
        <div className="space-y-2 mb-3">
          {(profile.education || []).map((x, i) => (
            <div key={i} className="flex items-start justify-between gap-2 border-b border-hair pb-2 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm text-paper">{x.degree}</p>
                <p className="text-xs text-muted">{[x.school, x.dates].filter(Boolean).join(" · ")}</p>
              </div>
              <button onClick={() => setProfile((p) => ({ ...p, education: p.education.filter((_, j) => j !== i) }))} className="text-muted hover:text-rust shrink-0" aria-label="Remove"><Icon name="x" size={13} /></button>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!eduForm.degree.trim()) return; setProfile((p) => ({ ...p, education: [...(p.education || []), { degree: eduForm.degree.trim(), school: eduForm.school.trim(), dates: eduForm.dates.trim() }] })); setEduForm({ degree: "", school: "", dates: "" }); }} className="flex flex-wrap gap-2">
          <input value={eduForm.degree} onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-1.5 text-sm focus-ring" placeholder="Degree" />
          <input value={eduForm.school} onChange={(e) => setEduForm((f) => ({ ...f, school: e.target.value }))} className="flex-1 min-w-32 rounded px-3 py-1.5 text-sm focus-ring" placeholder="School" />
          <input value={eduForm.dates} onChange={(e) => setEduForm((f) => ({ ...f, dates: e.target.value }))} className="w-28 rounded px-3 py-1.5 text-sm focus-ring" placeholder="2021 - 2023" />
          <button type="submit" disabled={!eduForm.degree.trim()} className="btn-ghost rounded px-3 py-1.5 text-sm focus-ring"><Icon name="plus" size={15} /></button>
        </form>
      </div>

      {/* Certifications rollup, mirrors Learning & Certs data */}
      <div className="bg-ink2 border border-hair rounded-lg p-5">
        <p className="text-sm font-medium text-paper mb-3 flex items-center gap-1.5"><Icon name="award" size={15} className="text-green" /> Licenses & certifications</p>
        {(profile.certifications || []).length > 0 && (
          <div className="space-y-2 mb-3">
            {(profile.certifications || []).map((cert, i) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b border-hair pb-2 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm text-paper truncate">{cert.name}</p>
                  {cert.issuer && <p className="text-xs text-muted">{cert.issuer}</p>}
                </div>
                <button onClick={() => setProfile((p) => ({ ...p, certifications: p.certifications.filter((_, j) => j !== i) }))} className="text-muted hover:text-rust shrink-0" aria-label="Remove"><Icon name="x" size={13} /></button>
              </div>
            ))}
          </div>
        )}
        {completedCerts.length === 0 && (profile.certifications || []).length === 0 ? (
          <p className="text-xs text-muted italic">None yet -- autofill from a resume above, or mark certifications complete in Interview Prep → Learning & Certs.</p>
        ) : completedCerts.length === 0 ? null : (
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
          <p className="text-xs text-muted mt-3 pt-3 border-t border-hair">Latest resume scan score: <span className="text-paper font-medium">{resumeResult.total}/100</span></p>
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
        <p className="text-xs text-muted mb-3">Store a copy of your resume, transcripts, or certificates -- up to 4MB each, visible only to your account.</p>
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

      <AccountSection username={username} jobs={jobs} contacts={contacts} todos={todos} resumeVersions={resumeVersions} resumeText={resumeText} resumeResult={resumeResult} interviewData={interviewData} learning={learning} profile={profile} documents={documents} onLogout={onLogout} toast={toast} />
    </div>
  );
}

/* ============================== ADMIN PANEL ============================== */
function AdminPanel({ onClose, toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [secret, setSecret] = useState("");
  const [usingMaster, setUsingMaster] = useState(false);

  const load = async (s) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin?action=list&secret=" + encodeURIComponent(s));
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Access denied -- wrong secret."); setLoading(false); return; }
      setUsers(data.users || []);
      setUsingMaster(!!data.usingMasterKey);
      setAuthed(true);
    } catch (e) { toast("error", "Couldn't reach the server."); }
    setLoading(false);
  };

  const doAction = async (userId, action) => {
    try {
      const res = await fetch("/api/auth/admin?action=" + action + "&userId=" + userId + "&secret=" + encodeURIComponent(secret));
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Failed."); return; }
      toast("success", data.message || "Done.");
      load(secret);
    } catch (e) { toast("error", "Couldn't reach the server."); }
  };

  const pending = users.filter((u) => u.status === "pending");
  const active  = users.filter((u) => u.status !== "pending");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(61,55,82,0.5)" }} onClick={onClose}>
      <div className="fade-in bg-ink2 border border-hair rounded-lg w-full max-w-lg p-5 max-h-screen overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="jshq-display text-lg text-paper">Admin panel</h3>
            {usingMaster && <p className="text-xs text-rust">Emergency access via master key -- reset ADMIN_SECRET when done.</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-main focus-ring rounded"><Icon name="x" size={18} /></button>
        </div>
        {!authed ? (
          <div>
            <form onSubmit={(e) => { e.preventDefault(); setSecret(secretInput); load(secretInput); }} className="flex gap-2">
              <input type="password" value={secretInput} onChange={(e) => setSecretInput(e.target.value)} className="flex-1 rounded px-3 py-2 text-sm focus-ring" placeholder="Enter ADMIN_SECRET (or ADMIN_MASTER_KEY if you forgot)" autoFocus />
              <button type="submit" className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring">Enter</button>
            </form>
            <p className="text-xs text-muted mt-2">Forgot ADMIN_SECRET? Add ADMIN_MASTER_KEY to Vercel env vars as a temporary bypass, then reset ADMIN_SECRET afterwards.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8"><Icon name="loader" size={20} spin /></div>
        ) : (
          <div className="space-y-4">
            {pending.length > 0 && (
              <div>
                <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Pending approval ({pending.length})</p>
                <div className="space-y-2">
                  {pending.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 p-3 rounded-lg" style={{ background: "#FDF6EA", border: "1px solid #EBD9B4" }}>
                      <div>
                        <p className="text-sm font-medium text-paper">{u.username}</p>
                        <p className="text-xs text-muted">{u.email || "no email"}{u.googleId ? " · Google" : ""}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => doAction(u.id, "approve")} className="btn-primary rounded px-3 py-1.5 text-xs font-medium focus-ring">Approve</button>
                        <button onClick={() => doAction(u.id, "reject")} className="rounded px-3 py-1.5 text-xs focus-ring" style={{ border: "1px solid #F3C9C0", color: "#D97862" }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted jshq-mono uppercase tracking-wide mb-2">Active accounts ({active.length})</p>
              {active.length === 0 ? <p className="text-xs text-muted italic">No active accounts yet.</p> : (
                <div className="space-y-2">
                  {active.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-ink3">
                      <div>
                        <p className="text-sm font-medium text-paper">{u.username}</p>
                        <p className="text-xs text-muted">{u.email || "no email"}{u.googleId ? " · Google" : ""}</p>
                      </div>
                      <button onClick={() => { if (window.confirm("Delete " + u.username + "? This permanently removes all their data.")) doAction(u.id, "delete"); }} className="text-xs text-muted hover:text-rust focus-ring rounded px-2 py-1">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
  { key: "todos", label: "To-dos", icon: "check" },
  { key: "contacts", label: "Contacts", icon: "users" },
  { key: "profile", label: "Profile", icon: "user" },
];

const DEFAULT_LEARNING = { targetRole: "", topics: [], certifications: [], summary: "" };
const DEFAULT_TODOS = { daily: [], weekly: [], lastDailyReset: "", lastWeeklyReset: "" };

// Monday of the current week, as YYYY-MM-DD -- used to auto-reset weekly to-dos.
function currentWeekStart() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}
const DEFAULT_PROFILE = { headline: "", bio: "", skills: [], avatar: "", experience: [], education: [], certifications: [] };
const AVATAR_CHOICES = ["🦊", "🐼", "🐨", "🐱", "🐶", "🦉", "🐧", "🐢", "🦁", "🐸", "🧑‍💻", "👩‍💼", "🧑‍🚀", "🧑‍🎨", "🥷", "🤖"];

function MainApp({ username, onLogout, toast }) {
  const [activeTab, setActiveTab] = useState("tracker");
  const [loaded, setLoaded] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [todos, setTodos] = useState(DEFAULT_TODOS);
  // Multiple resume versions: {activeId, versions: [{id, name, text, result}]}
  const [resumeVersions, setResumeVersions] = useState([{ id: "v_default", name: "Main resume", text: "", result: null }]);
  const [activeResumeId, setActiveResumeId] = useState("v_default");
  const activeResume = resumeVersions.find((v) => v.id === activeResumeId) || resumeVersions[0];
  const resumeText = activeResume ? activeResume.text : "";
  const resumeResult = activeResume ? activeResume.result : null;
  const setResumeText = (textOrFn) => setResumeVersions((prev) => prev.map((v) => {
    if (v.id !== activeResumeId) return v;
    const text = typeof textOrFn === "function" ? textOrFn(v.text) : textOrFn;
    return { ...v, text };
  }));
  const setResumeResult = (resultOrFn) => setResumeVersions((prev) => prev.map((v) => {
    if (v.id !== activeResumeId) return v;
    const result = typeof resultOrFn === "function" ? resultOrFn(v.result) : resultOrFn;
    return { ...v, result };
  }));
  const createResumeVersion = (name) => {
    const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setResumeVersions((prev) => [...prev, { id, name: name || `Version ${prev.length + 1}`, text: "", result: null }]);
    setActiveResumeId(id);
  };
  const renameResumeVersion = (id, name) => setResumeVersions((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)));
  const deleteResumeVersion = (id) => {
    setResumeVersions((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((v) => v.id !== id);
      if (id === activeResumeId) setActiveResumeId(next[0].id);
      return next;
    });
  };
  const [interviewData, setInterviewData] = useState({});
  const [learning, setLearning] = useState(DEFAULT_LEARNING);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [documents, setDocuments] = useState([]);
  const [matchPrefill, setMatchPrefill] = useState(null);

  const handleMatchJob = (job) => {
    setMatchPrefill({ jobDesc: job.jobDesc, at: Date.now() });
    setActiveTab("match");
  };

  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    (async () => {
      setLoadError(false);
      try {
        const responses = await Promise.all([
          api("/api/data/jobs"), api("/api/data/resume"), api("/api/data/interviews"), api("/api/data/learning"), api("/api/data/profile"), api("/api/data/documents"), api("/api/data/contacts"), api("/api/data/todos"),
        ]);
        // CRITICAL: if ANY response isn't a clean 200 (e.g. the deployment is
        // mid-rollout right after a code push), abort WITHOUT marking loaded.
        // If we marked loaded anyway, the auto-save effects below would
        // immediately overwrite the server's real data with empty state.
        if (responses.some((r) => !r.ok)) throw new Error("One or more data requests failed");
        const [jobsRes, resumeRes, interviewsRes, learningRes, profileRes, documentsRes, contactsRes, todosRes] = responses;
        const jobsBlob = (await jobsRes.json()).blob;
        const resumeBlob = (await resumeRes.json()).blob;
        const interviewsBlob = (await interviewsRes.json()).blob;
        const learningBlob = (await learningRes.json()).blob;
        const profileBlob = (await profileRes.json()).blob;
        const documentsBlob = (await documentsRes.json()).blob;
        const contactsBlob = (await contactsRes.json()).blob;
        const todosBlob = (await todosRes.json()).blob;

        const jobsData = parseBlob(jobsBlob, []);
        const resumeData = parseBlob(resumeBlob, { text: "", result: null });
        const interviewsData = parseBlob(interviewsBlob, {});
        const learningData = parseBlob(learningBlob, DEFAULT_LEARNING);
        const profileData = parseBlob(profileBlob, DEFAULT_PROFILE);
        const documentsData = parseBlob(documentsBlob, []);
        const contactsData = parseBlob(contactsBlob, []);
        let todosData = { ...DEFAULT_TODOS, ...(parseBlob(todosBlob, DEFAULT_TODOS) || {}) };
        // Auto-reset check-offs: daily each new day, weekly each new Monday.
        const todayStr = new Date().toISOString().slice(0, 10);
        const weekStr = currentWeekStart();
        if (todosData.lastDailyReset !== todayStr) {
          todosData = { ...todosData, daily: (todosData.daily || []).map((t) => ({ ...t, done: false })), lastDailyReset: todayStr };
        }
        if (todosData.lastWeeklyReset !== weekStr) {
          todosData = { ...todosData, weekly: (todosData.weekly || []).map((t) => ({ ...t, done: false })), lastWeeklyReset: weekStr };
        }

        setJobs(jobsData || []);
        setContacts(contactsData || []);
        setTodos(todosData);
        // Resume: accept both the new multi-version shape and the legacy single {text, result}
        if (resumeData && Array.isArray(resumeData.versions) && resumeData.versions.length) {
          setResumeVersions(resumeData.versions);
          setActiveResumeId(resumeData.versions.some((v) => v.id === resumeData.activeId) ? resumeData.activeId : resumeData.versions[0].id);
        } else {
          setResumeVersions([{ id: "v_default", name: "Main resume", text: (resumeData && resumeData.text) || "", result: (resumeData && resumeData.result) || null }]);
          setActiveResumeId("v_default");
        }
        setInterviewData(interviewsData || {});
        setLearning({ ...DEFAULT_LEARNING, ...(learningData || {}) });
        setProfile({ ...DEFAULT_PROFILE, ...(profileData || {}) });
        setDocuments(documentsData || []);
        setLoaded(true); // saves are only ever enabled after a fully successful load
      } catch (e) {
        console.error("[load error]", e && e.message, e);
        setLoadError(true); // loaded stays false -> nothing can overwrite server data
      }
    })();
  }, [loadAttempt]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(jobs);
        await api("/api/data/jobs", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [jobs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify({ activeId: activeResumeId, versions: resumeVersions });
        await api("/api/data/resume", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [resumeVersions, activeResumeId, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(contacts);
        await api("/api/data/contacts", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [contacts, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(todos);
        await api("/api/data/todos", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [todos, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(interviewData);
        await api("/api/data/interviews", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [interviewData, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(learning);
        await api("/api/data/learning", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [learning, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(profile);
        await api("/api/data/profile", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [profile, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        const blob = JSON.stringify(documents);
        await api("/api/data/documents", { method: "PUT", body: JSON.stringify({ blob }) });
      } catch (e) { toast("error", "Couldn't save your last change."); }
    })();
  }, [documents, loaded]);

  const activeMeta = TABS.find((t) => t.key === activeTab);

  if (loadError) {
    return (
      <div className="jshq min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Icon name="info" size={24} className="text-rust mx-auto mb-3" />
          <h2 className="jshq-display text-lg text-paper">Couldn't load your data</h2>
          <p className="text-muted text-sm mt-1 mb-4">This usually happens right after a new deployment. Your saved data is untouched. If this keeps happening, check Vercel Logs for a <code>[load error]</code> line -- it will say exactly what failed.</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setLoadAttempt((n) => n + 1)} className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring">Retry</button>
            <button onClick={onLogout} className="btn-ghost rounded px-4 py-2 text-sm focus-ring">Log out</button>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <div className="jshq min-h-screen flex items-center justify-center"><Icon name="loader" size={20} spin /></div>;
  }

  return (
    <div className="jshq min-h-screen w-full flex flex-col sm:flex-row">
      <aside className="hidden sm:flex flex-col bg-ink2 border-r border-hair p-4" style={{ width: 224, flexShrink: 0 }}>
        <div className="mb-6 px-2 flex items-center gap-2.5">
          <Logo size={34} />
          <div>
            <h1 className="jshq-display text-lg text-paper leading-tight">Job Search HQ</h1>
            <p className="jshq-mono text-brass tracking-widest" style={{ fontSize: 9 }}>CAREER COMMAND CENTER</p>
          </div>
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
            <Avatar avatar={profile.avatar} username={username} size={24} fontSize={profile.avatar ? 14 : 10} />
            <span className="text-xs text-main truncate">{username}</span>
          </div>
          <button onClick={onLogout} className="text-xs text-muted hover:text-rust flex items-center gap-1.5"><Icon name="logout" size={13} /> Log out</button>
          {isAdmin && <button onClick={() => setShowAdmin(true)} className="text-xs text-muted hover:text-brass flex items-center gap-1.5 mt-1"><Icon name="users" size={13} /> Admin panel</button>}
        </div>
      </aside>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} toast={toast} />}

      <div className="sm:hidden bg-ink2 border-b border-hair px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={28} />
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
            {activeTab === "tracker" && <TrackerTab jobs={jobs} setJobs={setJobs} onMatchJob={handleMatchJob} toast={toast} />}
            {activeTab === "scanner" && <ResumeScannerTab resumeText={resumeText} setResumeText={setResumeText} resumeResult={resumeResult} setResumeResult={setResumeResult} versions={resumeVersions} activeId={activeResumeId} onSelectVersion={setActiveResumeId} onCreateVersion={createResumeVersion} onRenameVersion={renameResumeVersion} onDeleteVersion={deleteResumeVersion} toast={toast} />}
            {activeTab === "todos" && <TodosTab todos={todos} setTodos={setTodos} toast={toast} />}
            {activeTab === "contacts" && <ContactsTab contacts={contacts} setContacts={setContacts} toast={toast} />}
            {activeTab === "match" && <MatchAnalyzerTab resumeText={resumeText} setResumeText={setResumeText} prefill={matchPrefill} toast={toast} />}
            {activeTab === "prep" && <InterviewPrepSection jobs={jobs} interviewData={interviewData} setInterviewData={setInterviewData} learning={learning} setLearning={setLearning} toast={toast} />}
            {activeTab === "profile" && <ProfileTab username={username} jobs={jobs} contacts={contacts} todos={todos} resumeVersions={resumeVersions} resumeText={resumeText} resumeResult={resumeResult} interviewData={interviewData} learning={learning} profile={profile} setProfile={setProfile} documents={documents} setDocuments={setDocuments} onLogout={onLogout} toast={toast} />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================== ROOT ============================== */
/* ============================== RESET PASSWORD (from email link) ============================== */
function ResetPasswordScreen({ token, onDone, toast }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw.length < 6) { setError("Use at least 6 characters."); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed."); setBusy(false); return; }
      toast("success", data.message || "Password reset -- log in now.");
      onDone();
    } catch (err) {
      setError("Couldn't reach the server.");
      setBusy(false);
    }
  };

  return (
    <div className="jshq min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Icon name="lock" size={22} className="text-brass mx-auto mb-2" />
          <h1 className="jshq-display text-xl text-paper">Set a new password</h1>
        </div>
        <form onSubmit={submit} className="bg-ink2 border border-hair rounded-lg p-5 space-y-3">
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded px-3 py-2 text-sm focus-ring" placeholder="New password (6+ characters)" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded px-3 py-2 text-sm focus-ring" placeholder="Confirm new password" />
          {error && <p className="text-xs text-rust">{error}</p>}
          <button type="submit" disabled={busy || !pw || !confirm} className="btn-primary w-full rounded px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 focus-ring">
            {busy && <Icon name="loader" size={15} spin />} Reset password
          </button>
        </form>
      </div>
    </div>
  );
}

function Root() {
  const [phase, setPhase] = useState("checking");
  const [username, setUsername] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get("reset"));

  const toast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const [checkAttempt, setCheckAttempt] = useState(0);

  useEffect(() => {
    if (resetToken) { setPhase("resetPassword"); return; }
    (async () => {
      const token = getToken();
      if (!token) { setPhase("loggedOut"); return; }
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setPhase("loggedIn");
        } else if (res.status === 401) {
          // Token genuinely invalid/expired -- a real logout is correct here.
          clearSession();
          setPhase("loggedOut");
        } else {
          // Server hiccup (e.g. mid-deployment): session is still valid,
          // so don't dump to login -- offer a retry instead.
          setPhase("authError");
        }
      } catch (e) {
        setPhase("authError");
      }
    })();
  }, [checkAttempt]);

  const handleAuthed = (uname) => { setUsername(uname); setPhase("loggedIn"); };
  const handleGoogleResult = (data) => { setUsername(data.username); setPhase("loggedIn"); };
  const handleLogout = () => {
    clearSession();
    setUsername(null);
    setPhase("loggedOut");
    toast("info", "Logged out");
  };

  if (phase === "checking") {
    return <div className="jshq min-h-screen flex items-center justify-center"><Icon name="loader" size={20} spin /></div>;
  }

  if (phase === "authError") {
    return (
      <div className="jshq min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <Icon name="info" size={24} className="text-rust mx-auto mb-3" />
          <h2 className="jshq-display text-lg text-paper">Couldn't reach the server</h2>
          <p className="text-muted text-sm mt-1 mb-4">You're still logged in -- this usually clears up in a minute (often right after a new deployment).</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => { setPhase("checking"); setCheckAttempt((n) => n + 1); }} className="btn-primary rounded px-4 py-2 text-sm font-medium focus-ring">Retry</button>
            <button onClick={() => { clearSession(); setPhase("loggedOut"); }} className="btn-ghost rounded px-4 py-2 text-sm focus-ring">Log in again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {phase === "resetPassword" && <ResetPasswordScreen token={resetToken} onDone={() => { window.history.replaceState({}, "", window.location.pathname); setResetToken(null); setPhase("loggedOut"); }} toast={toast} />}
      {phase === "loggedOut" && <AuthScreen onAuthed={handleAuthed} onGoogleResult={handleGoogleResult} toast={toast} />}
      {phase === "loggedIn" && <MainApp username={username} onLogout={handleLogout} toast={toast} />}
      <ToastStack toasts={toasts} remove={removeToast} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
