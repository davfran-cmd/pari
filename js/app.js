/* Procedo: presenze, recuperi e appunti. Tutti i dati restano in localStorage sul dispositivo. */
(() => {
'use strict';

const KEY = 'procedo.state.v1';
const OLD_KEY = 'pari.state.v1'; // nome usato dalle prime versioni: i dati si spostano da soli sotto KEY
// Colori dei corsi: mai blu, arancione o menta (sono i colori di stato).
const TINTS = [
  '#CB30E0', '#FF2D55', '#6155F5', '#AC7F5E', '#00C3D0', '#34C759', '#FF383C', '#8E8E93',
  '#9B5DE5', '#3F51B5', '#00C0E8', '#1E9E4A', '#A4C61A', '#FFCC00', '#FF6F91', '#C2185B',
  '#7A5230', '#48484A', '#2C3E50', '#E84393'
];
const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const DAY_LONG = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const DAY_LETTER = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
const WEEKDAYS = [1, 2, 3, 4, 5, 6];
const MAX_WEEKS = 30;
const SEGV = { S: 'var(--blue)', R: 'var(--recup)', M: 'var(--orange)' };
const SWIPE_T = 90;

/* ---------- Icone ---------- */
const sv = (s, body, attrs) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true" ${attrs}>${body}</svg>`;
const STROKE = (w) => `fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const I = {
  plus: (s = 26, w = 2.6) => sv(s, '<path d="M12 5v14M5 12h14"/>', STROKE(w)),
  grid: (s = 24) => sv(s, '<rect x="3" y="3" width="8" height="8" rx="2.5"/><rect x="13" y="3" width="8" height="8" rx="2.5"/><rect x="3" y="13" width="8" height="8" rx="2.5"/><rect x="13" y="13" width="8" height="8" rx="2.5"/>', 'fill="currentColor"'),
  gridO: (s = 24) => sv(s, '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>', 'fill="none" stroke="currentColor" stroke-width="1.9"'),
  archO: (s = 24) => sv(s, '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>', STROKE(1.9)),
  archF: (s = 24) => sv(s, '<rect x="2.6" y="3.6" width="18.8" height="5.6" rx="1.6"/><path d="M4.3 10.6h15.4v7.6a2.6 2.6 0 0 1-2.6 2.6H6.9a2.6 2.6 0 0 1-2.6-2.6z M10 13.1h4a.85.85 0 0 1 0 1.7h-4a.85.85 0 0 1 0-1.7z"/>', 'fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"'),
  person: (s = 20) => sv(s, '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="9.6" r="3.2"/><path d="M5.6 18.4c1.5-2.1 3.8-3.2 6.4-3.2s4.9 1.1 6.4 3.2"/>', STROKE(1.7)),
  back: (s = 20) => sv(s, '<path d="m15 5-7 7 7 7"/>', STROKE(2.4)),
  close: (s = 16) => sv(s, '<path d="M6 6l12 12M18 6 6 18"/>', STROKE(2.8)),
  check: (s = 14, w = 2.8) => sv(s, '<path d="m5 12 5 5 9-10"/>', STROKE(w)),
  warn: (s = 13) => sv(s, '<path d="M10.2 3.5a2.1 2.1 0 0 1 3.6 0l8.1 14.1a2.1 2.1 0 0 1-1.8 3.1H3.9a2.1 2.1 0 0 1-1.8-3.1z M12 8.3c.6 0 1.05.47 1.03 1.07l-.17 4.8a.86.86 0 0 1-1.72 0l-.17-4.8c-.02-.6.43-1.07 1.03-1.07z M12 16.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>', 'fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"'),
  recup: (s = 14, w = 2.6) => sv(s, '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>', STROKE(w)),
  doc: (s = 13) => sv(s, '<path d="M7.2 2.3h6.3c.6 0 1.1.2 1.5.6l4.1 4.1c.4.4.6.9.6 1.5v10.8a2.4 2.4 0 0 1-2.4 2.4H7.2a2.4 2.4 0 0 1-2.4-2.4V4.7a2.4 2.4 0 0 1 2.4-2.4z M9 11.4h6a.8.8 0 0 1 0 1.6H9a.8.8 0 0 1 0-1.6z M9 15h6a.8.8 0 0 1 0 1.6H9A.8.8 0 0 1 9 15z"/>', 'fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"'),
  docCheck: (s = 18) => sv(s, '<path d="M7.2 2.3h6.3c.6 0 1.1.2 1.5.6l4.1 4.1c.4.4.6.9.6 1.5v10.8a2.4 2.4 0 0 1-2.4 2.4H7.2a2.4 2.4 0 0 1-2.4-2.4V4.7a2.4 2.4 0 0 1 2.4-2.4z M15.6 11.3a.9.9 0 0 0-1.27.06l-3.3 3.66-1.4-1.4a.9.9 0 1 0-1.27 1.27l2.07 2.07a.9.9 0 0 0 1.31-.03l3.92-4.36a.9.9 0 0 0-.06-1.27z"/>', 'fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"'),
  docO: (s = 18) => sv(s, '<path d="M7.2 3.1h6.2l5.8 5.8v10.5a1.6 1.6 0 0 1-1.6 1.6H7.2a1.6 1.6 0 0 1-1.6-1.6V4.7a1.6 1.6 0 0 1 1.6-1.6z"/><path d="M13.3 3.2v4.2a1.5 1.5 0 0 0 1.5 1.5H19"/>', STROKE(1.7)),
  lock: (s = 12) => sv(s, '<path d="M7.6 10.4V8a4.4 4.4 0 0 1 8.8 0v2.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="4.6" y="10" width="14.8" height="11.4" rx="2.6" fill="currentColor"/>', ''),
  restore: (s = 18) => sv(s, '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v5h5"/>', STROKE(2.4)),
  chev: (s = 14, w = 2.8, cls = '') => sv(s, '<path d="m9 5 7 7-7 7"/>', STROKE(w) + (cls ? ` class="${cls}"` : '')),
  sidebar: (s = 22) => sv(s, '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9.5 4.5v15M5.5 8.5h1.5M5.5 11h1.5"/>', STROKE(1.8)),
  sliders: (s = 22) => sv(s, '<path d="M4 6h8.5M17.5 6H20M4 12h1.5M10.5 12H20M4 18h6.5M15.5 18H20"/><circle cx="15" cy="6" r="2.5"/><circle cx="8" cy="12" r="2.5"/><circle cx="13" cy="18" r="2.5"/>', STROKE(1.8)),
  cal: (s = 17) => sv(s, '<rect x="3.2" y="4.6" width="17.6" height="16" rx="3"/><path d="M3.2 9.6h17.6M8 2.8v3.4M16 2.8v3.4"/>', STROKE(2)),
  bell: (s = 16) => sv(s, '<path d="M12 2.4c.8 0 1.4.6 1.4 1.4v.45a6.1 6.1 0 0 1 4.7 5.95v3.5l1.55 2.25c.5.75-.03 1.75-.93 1.75H5.28c-.9 0-1.43-1-.93-1.75L5.9 13.7v-3.5a6.1 6.1 0 0 1 4.7-5.95V3.8c0-.8.6-1.4 1.4-1.4z M9.6 19.05h4.8a2.4 2.4 0 0 1-4.8 0z"/>', 'fill="currentColor"'),
  box: (s = 16) => sv(s, '<rect x="2.6" y="3.6" width="18.8" height="5.6" rx="1.6"/><path d="M4.3 10.6h15.4v7.6a2.6 2.6 0 0 1-2.6 2.6H6.9a2.6 2.6 0 0 1-2.6-2.6z M10 13.1h4a.85.85 0 0 1 0 1.7h-4a.85.85 0 0 1 0-1.7z"/>', 'fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"'),
  folderPlus: (s = 64) => sv(s, '<path d="M20.5 11V8.4a2 2 0 0 0-2-2h-6.3L10.6 4.6a2 2 0 0 0-1.4-.6H5.5a2 2 0 0 0-2 2v11.6a2 2 0 0 0 2 2H11"/><circle cx="17.5" cy="17.5" r="4.5"/><path d="M17.5 15.4v4.2M15.4 17.5h4.2"/>', STROKE(1.7)),
  share: (s = 17) => sv(s, '<path d="M8.5 9.5H7.2a2.2 2.2 0 0 0-2.2 2.2v7.1a2.2 2.2 0 0 0 2.2 2.2h9.6a2.2 2.2 0 0 0 2.2-2.2v-7.1a2.2 2.2 0 0 0-2.2-2.2h-1.3"/><path d="M12 3v11M8.6 6.3 12 2.9l3.4 3.4"/>', STROKE(2)),
  download: (s = 17) => sv(s, '<path d="M8.5 9.5H7.2a2.2 2.2 0 0 0-2.2 2.2v7.1a2.2 2.2 0 0 0 2.2 2.2h9.6a2.2 2.2 0 0 0 2.2-2.2v-7.1a2.2 2.2 0 0 0-2.2-2.2h-1.3"/><path d="M12 3v11M8.6 10.7 12 14.1l3.4-3.4"/>', STROKE(2)),
  trash: (s = 17) => sv(s, '<path d="M4 6.5h16M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M6 6.5l.9 12.6A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 6.5M10 10.5v6.5M14 10.5v6.5"/>', STROKE(1.9)),
  clock: (s = 17) => sv(s, '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', STROKE(2)),
  bookO: (s = 24) => sv(s, '<path d="M12 6.6C10.2 5.2 7.6 4.6 4.3 4.6v13.2c3.3 0 5.9.6 7.7 2 1.8-1.4 4.4-2 7.7-2V4.6c-3.3 0-5.9.6-7.7 2z"/><path d="M12 6.6v13.2"/>', STROKE(1.9)),
  bookF: (s = 24) => sv(s, '<path d="M11.2 5.7C9.3 4.4 6.8 3.8 3.6 3.8a.9.9 0 0 0-.9.9v13.2c0 .5.4.9.9.9 3 0 5.4.6 7.2 1.8.2.1.4 0 .4-.2z M12.8 5.7c1.9-1.3 4.4-1.9 7.6-1.9.5 0 .9.4.9.9v13.2c0 .5-.4.9-.9.9-3 0-5.4.6-7.2 1.8-.2.1-.4 0-.4-.2z"/>', 'fill="currentColor"'),
  target: (s = 17) => sv(s, '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>', STROKE(2)),
  updown: (s = 12) => sv(s, '<path d="m7 9 5-5 5 5M7 15l5 5 5-5"/>', STROKE(2.6)),
  info: (s = 15) => sv(s, '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>', STROKE(2.2)),
  wand: (s = 17) => sv(s, '<path d="M4.5 19.5 14.5 9.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M16.5 1.9Q16.5 4.5 19.1 4.5Q16.5 4.5 16.5 7.1Q16.5 4.5 13.9 4.5Q16.5 4.5 16.5 1.9ZM20.2 8Q20.2 10 22.2 10Q20.2 10 20.2 12Q20.2 10 18.2 10Q20.2 10 20.2 8ZM9.5 2.3Q9.5 4 11.2 4Q9.5 4 9.5 5.7Q9.5 4 7.8 4Q9.5 4 9.5 2.3Z" fill="currentColor"/>', '')
};

/* ---------- Utilità ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const yesterdayISO = () => { const d = new Date(); d.setDate(d.getDate() - 1); return isoOf(d); };
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtShortD = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtDayMonth = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
const fmtLongD = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const clean = (s) => s.replace(/\./g, '').replace(/,/g, '');
const fmtShort = (iso) => clean(fmtShortD.format(parseISO(iso)));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtToday = () => cap(fmtLongD.format(new Date()));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const plural = (n, one, many) => (n === 1 ? one : many);
function defaultYear() {
  const d = new Date(); const y = d.getFullYear();
  return d.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}
function defaultSemTitle() { const m = new Date().getMonth(); return (m >= 8 || m <= 1) ? '1° Semestre' : '2° Semestre'; }
function shortYear(y) { const m = /^(\d{4})\s*\/\s*(\d{4})$/.exec(y || ''); return m ? `${m[1].slice(2)}/${m[2].slice(2)}` : (y || ''); }
const DAY_MS = 864e5;
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
// Settimane da quella di `iso` a quella attuale, inclusa (1 = questa settimana).
function weeksSince(iso) { return Math.round((mondayOf(new Date()) - mondayOf(parseISO(iso))) / (7 * DAY_MS)) + 1; }
// Date (fino a oggi) delle ultime `weeks` settimane che cadono nei giorni di lezione.
function pastDates(days, weeks) {
  const start = addDays(mondayOf(new Date()), -7 * (weeks - 1));
  const t = todayISO(), out = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i), iso = isoOf(d);
    if (iso > t) break;
    if (days.includes(d.getDay())) out.push(iso);
  }
  return out;
}
// Inizio lezioni presunto: ultimo lunedì di settembre (1° sem.) o primo lunedì di marzo (2° sem.).
function guessStart(title, year) {
  const m = /^(\d{4})\s*\/\s*(\d{4})$/.exec(year || '');
  if (!m) return isoOf(mondayOf(new Date()));
  if (/^2/.test(title)) { const d = new Date(+m[2], 2, 1); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); return isoOf(d); }
  const d = new Date(+m[1], 8, 30); while (d.getDay() !== 1) d.setDate(d.getDate() - 1); return isoOf(d);
}
const semStart = (sem) => (sem && (sem.start || guessStart(sem.title, sem.year))) || todayISO();
const clampWeeks = (n) => Math.max(1, Math.min(MAX_WEEKS, n));
const daysLabel = (days) => (Array.isArray(days) && days.length ? days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DAY_SHORT[d]).join(', ') : '');
const DAY_TOKENS = { dom: 0, lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6 };
// Converte il vecchio campo testo (es. "Lun–Gio", "lun, mer") in numeri di giorno.
function parseDays(txt) {
  const out = new Set();
  String(txt || '').toLowerCase().split(/[,;/\s]+|\be\b/).forEach((part) => {
    const r = part.split(/[–—-]/).map((p) => DAY_TOKENS[p.trim().slice(0, 3)]);
    if (r.length === 2 && r[0] != null && r[1] != null) { for (let d = r[0]; ; d = (d + 1) % 7) { out.add(d); if (d === r[1]) break; } }
    else if (r[0] != null) out.add(r[0]);
  });
  return [...out];
}
// Testo nero sui colori chiari (es. giallo), bianco sugli altri.
function onTint(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#FFFFFF';
  const n = parseInt(m[1], 16);
  return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 186 ? '#1C1C1E' : '#FFFFFF';
}

const STOP = /^(di|e|ed|del|della|dello|dei|degli|delle|la|il|lo|le|i|gli|a|al|in|per|con|da|ad)$/i;
function autoCode(name) {
  const w = name.trim().split(/\s+/).filter((x) => x && !STOP.test(x) && /[A-Za-zÀ-ÿ]/.test(x));
  if (!w.length) return '';
  if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
  return (w[0][0] + w[1][0]).toUpperCase();
}

/* ---------- Stato persistente ---------- */
function defaultState() {
  return { v: 1, theme: 'automatico', remind: true, remindDays: 3, auto: true, autoP: 'S', semesters: [], courses: [], exams: [], degreeCfu: 180, target: '' };
}
function migrate(s) {
  const d = defaultState();
  if (!s || typeof s !== 'object') return d;
  const out = Object.assign(d, s);
  out.semesters = Array.isArray(out.semesters) ? out.semesters : [];
  out.courses = Array.isArray(out.courses) ? out.courses : [];
  out.courses.forEach((c) => {
    c.lessons = Array.isArray(c.lessons) ? c.lessons : [];
    if (!Array.isArray(c.days)) c.days = parseDays(c.days);
    if (!c.autoUntil) c.autoUntil = yesterdayISO();
  });
  out.exams = Array.isArray(out.exams) ? out.exams.filter((e) => e && e.id) : [];
  return out;
}
// App Android: i dati stanno in un file scritto subito (vedi MainActivity); localStorage resta come copia.
const NATIVE = window.ProcedoAndroid && window.ProcedoAndroid.saveState ? window.ProcedoAndroid : null;
function load() {
  try {
    // Al primo avvio della versione col file, i dati arrivano dal localStorage e passano nel file.
    const raw = (NATIVE && NATIVE.loadState()) || localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { /* stato corrotto: riparte vuoto */ }
  return defaultState();
}
let S = load();
function save() {
  const json = JSON.stringify(S);
  let ok = true;
  if (NATIVE) ok = NATIVE.saveState(json);
  try { localStorage.setItem(KEY, json); } catch (e) { if (!NATIVE) ok = false; }
  if (!ok) toast('Impossibile salvare i dati', true);
}
if (NATIVE && !NATIVE.loadState() && localStorage.getItem(KEY)) save();
// Dati salvati col vecchio nome: li riscrive sotto il nome nuovo e, solo se è andata bene, toglie la vecchia copia.
try {
  if (localStorage.getItem(OLD_KEY) != null) {
    if (localStorage.getItem(KEY) == null) save();
    if (localStorage.getItem(KEY) != null) localStorage.removeItem(OLD_KEY);
  }
} catch (e) { /* localStorage non disponibile */ }
function commit(fn) { fn(); save(); render(); }

/* Stato UI (non salvato) */
const ui = { rings: {}, filter: 'all', sel: null, side: null, open: {}, sheet: null, sheetNew: false, toast: null };

/* ---------- Modello ---------- */
const curSem = () => S.semesters.find((s) => s.status === 'current') || null;
const semById = (id) => S.semesters.find((s) => s.id === id) || null;
const courseById = (id) => S.courses.find((c) => c.id === id) || null;
const coursesOf = (semId) => S.courses.filter((c) => c.semId === semId);
const curCourses = () => { const s = curSem(); return s ? coursesOf(s.id) : []; };
function sortedLessons(c) {
  return c.lessons.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.t || 0) - (b.t || 0)));
}
function stats(c) {
  const L = sortedLessons(c);
  let s = 0, r = 0, m = 0, done = 0, upTo = 0, broke = false;
  L.forEach((l, i) => {
    if (l.p === 'S') s++; else if (l.p === 'R') r++; else m++;
    if (l.a) done++;
    if (!broke) { if (l.a) upTo = i + 1; else broke = true; }
  });
  const total = L.length;
  return { L, total, s, r, m, done, upTo, onTrack: total - m, gap: total - done };
}
const lessonNum = (c, id) => sortedLessons(c).findIndex((l) => l.id === id) + 1;
const P_LABEL = { S: 'Presente', M: 'Da recuperare', R: 'Recuperata' };
function semStats(courses) {
  let total = 0, m = 0, gap = 0;
  courses.forEach((c) => { const st = stats(c); total += st.total; m += st.m; gap += st.gap; });
  return { total, m, gap, onTrack: total - m, notes: total - gap };
}
function notesLabel(st) {
  if (!st.total) return 'Nessuna lezione';
  if (st.done === st.total) return `Tutti, ${st.total} su ${st.total}`;
  return `${st.done} su ${st.total}`;
}
// Da dove ripartire con gli appunti: la prima lezione non ancora sistemata.
const notesNext = (st) => (st.total && st.done < st.total ? `Il primo da sistemare è la Lezione ${st.upTo + 1}` : '');
const notesAria = (st) => `${st.done} appunti sistemati su ${st.total}`;
function staleNotes() {
  if (!S.remind) return [];
  const lim = new Date(); lim.setDate(lim.getDate() - (S.remindDays || 3));
  const limIso = isoOf(lim);
  const out = [];
  curCourses().forEach((c) => c.lessons.forEach((l) => { if (!l.a && l.date <= limIso) out.push({ c, l }); }));
  return out;
}

/* ---------- Libretto ----------
   Esame: { id, name, cfu, status: 'passed' | 'todo', kind: 'voto' | 'idoneita', grade: 18..31 (31 = 30 e lode),
   date, sim (voto ipotetico degli esami da sostenere), courseId (facoltativo), tint, code }. */
const GRADES = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const gradeLabel = (g) => (g === 31 ? '30L' : String(g));
const gradeValue = (g) => Math.min(30, g); // 30 e lode vale 30 nella media
const examById = (id) => S.exams.find((e) => e.id === id) || null;
const fmtNum = (n, d = 2) => n.toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });
// Con un corso collegato l'esame ne usa colore e sigla; senza (o se il corso è stato eliminato) usa i propri.
function examLook(e) {
  const c = e.courseId && courseById(e.courseId);
  return c ? { tint: c.tint, code: c.code || '?' } : { tint: e.tint || TINTS[0], code: e.code || autoCode(e.name) || '?' };
}
// Medie ponderata (sui CFU) e aritmetica. Con `sim` contano anche i voti ipotetici degli esami da sostenere.
function libStats(sim) {
  let w = 0, wc = 0, sum = 0, n = 0, cfu = 0, passed = 0;
  S.exams.forEach((e) => {
    const k = Number(e.cfu) || 0;
    let g = 0;
    if (e.status === 'passed') { cfu += k; passed++; if (e.kind !== 'idoneita') g = e.grade || 0; }
    else if (sim && e.kind !== 'idoneita') g = e.sim || 0;
    if (!g) return;
    w += gradeValue(g) * k; wc += k; sum += gradeValue(g); n++;
  });
  return { avg: wc ? w / wc : null, arith: n ? sum / n : null, w, wc, cfu, passed };
}
// Voto medio che serve nei CFU che mancano alla laurea per arrivare alla media obiettivo.
function targetInfo() {
  const t = parseFloat(String(S.target).replace(',', '.'));
  if (!t) return null;
  const st = libStats(false);
  const todo = S.exams.filter((e) => e.status !== 'passed');
  const todoIdo = todo.filter((e) => e.kind === 'idoneita').reduce((a, e) => a + (Number(e.cfu) || 0), 0);
  const total = Number(S.degreeCfu) || 0;
  const left = total ? total - st.cfu - todoIdo : todo.filter((e) => e.kind !== 'idoneita').reduce((a, e) => a + (Number(e.cfu) || 0), 0);
  if (left <= 0) return { t, left: 0, avg: st.avg };
  return { t, left, avg: st.avg, need: (t * (st.wc + left) - st.w) / left, max: (st.w + 30 * left) / (st.wc + left) };
}

/* Aggiunge da sola le lezioni dei giorni in calendario, dall'ultimo controllo (autoUntil) a oggi.
   Le lezioni eliminate non tornano perché autoUntil va solo avanti. */
function autoSync() {
  const t = todayISO();
  let added = 0;
  curCourses().forEach((c) => {
    const days = Array.isArray(c.days) ? c.days : [];
    if (S.auto !== false && days.length) {
      const have = new Set(c.lessons.map((l) => l.date));
      let d = c.autoUntil ? addDays(parseISO(c.autoUntil), 1) : parseISO(t);
      for (let i = 0; isoOf(d) <= t && i < 400; i++, d = addDays(d, 1)) {
        const iso = isoOf(d);
        if (days.includes(d.getDay()) && !have.has(iso)) {
          c.lessons.push({ id: uid(), date: iso, topic: '', p: S.autoP === 'M' ? 'M' : 'S', a: false, t: Date.now() + added, auto: true, chk: true });
          added++;
        }
      }
    }
    c.autoUntil = t;
  });
  if (added) save();
  return added;
}
// Lezioni aggiunte dal calendario che aspettano la tua conferma (c'eri o no?), dalla più vecchia.
function pendingLessons() {
  const out = [];
  curCourses().forEach((c) => c.lessons.forEach((l) => { if (l.chk) out.push({ c, l }); }));
  return out.sort((a, b) => (a.l.date < b.l.date ? -1 : a.l.date > b.l.date ? 1 : 0));
}
const dayName = (iso) => (iso === todayISO() ? 'Oggi' : iso === yesterdayISO() ? 'Ieri' : cap(fmtShort(iso)));
function runAutoSync() {
  const n = autoSync();
  if (!n) return;
  render();
  toast(`${n} ${plural(n, 'lezione aggiunta', 'lezioni aggiunte')} dal calendario: confermale nella Home`);
}

/* ---------- Componenti ---------- */
const codeIcon = (c, size, radius, font) =>
  `<span class="code-icon${radius * 2 >= size ? ' round' : ''}" aria-hidden="true" style="width:${size}px;height:${size}px;background:${esc(c.tint)};color:${onTint(c.tint)};font-size:${font}px">${esc(c.code || '?')}</span>`;

function segBar(L, h = 8) {
  if (!L.length) return `<div class="track" style="height:${h}px"></div>`;
  const dense = L.length > 24;
  const hasM = L.some((l) => l.p === 'M'), hm = Math.round(h * 1.75);
  // Le lezioni perse sono più alte: il "buco" si vede subito, come nei grafici di Salute.
  return `<div class="segs" style="gap:${dense ? 2 : 3}px;${hasM ? `height:${hm}px;` : ''}">${L.map((l) => `<span style="height:${l.p === 'M' ? hm : h}px;border-radius:${dense ? 2 : (l.p === 'M' ? hm / 2 : 4)}px;background:${SEGV[l.p]}"></span>`).join('')}</div>`;
}
function notesBar(p, knob = true, h = 8) {
  return `<div class="nbar" style="height:${h}px"><div class="nfill" style="width:${p}%"></div>${knob ? `<div class="knob" style="left:clamp(-2px, calc(${p}% - 9px), calc(100% - 16px))"></div>` : ''}</div>`;
}
/* Anelli in stile Fitness, uguali in tutta l'app: stesso spessore, gradiente vivo su una traccia dello
   stesso colore, estremità arrotondate. `rings` = anelli dall'esterno: { color, arcs: [{ p, start, color }] }.
   Gli archi si animano dal valore mostrato prima (da zero quando entri nella schermata); `key` distingue gli anelli. */
const RING_W = 14, RING_R = [46, 30];
function ringSvg(size, rings, aria, key) {
  const prev = ui.rings[key], lens = [];
  let body = '';
  rings.forEach((ring, k) => {
    const r = RING_R[k], C = 2 * Math.PI * r;
    body += `<circle cx="54" cy="54" r="${r}" fill="none" stroke="var(--track-${ring.color})" stroke-width="${RING_W}"/>`;
    // Gli archi si disegnano nell'ordine dato: l'ultimo sta sopra, con le estremità intere.
    ring.arcs.forEach((a) => {
      const len = C * Math.max(0, Math.min(1, a.p)), from = prev ? prev[lens.length] : 0;
      lens.push(len);
      if (len <= 0) return; // con le estremità arrotondate un arco vuoto lascerebbe un puntino
      const anim = Math.abs(from - len) > 0.5
        ? `<animate attributeName="stroke-dasharray" from="${from.toFixed(1)} 999" to="${len.toFixed(1)} 999" dur="1s" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.85 0.3 1" fill="freeze"/>` : '';
      body += `<circle cx="54" cy="54" r="${r}" fill="none" stroke="url(#rg-${a.color || ring.color})" stroke-width="${RING_W}" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} 999" stroke-dashoffset="${(-C * (a.start || 0)).toFixed(1)}" transform="rotate(-90 54 54)">${anim}</circle>`;
    });
  });
  ui.rings[key] = lens;
  const grad = (c) => `<linearGradient id="rg-${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ring-${c}-a)"/><stop offset="1" stop-color="var(--ring-${c}-b)"/></linearGradient>`;
  return `<svg class="fring" width="${size}" height="${size}" viewBox="0 0 108 108" ${aria ? `role="img" aria-label="${esc(aria)}"` : 'aria-hidden="true"'}>
    <defs>${grad('blue')}${grad('mint')}${grad('orange')}</defs>${body}</svg>`;
}
const RING_SIZE = 120;
function ringsFor(ss, size, key) {
  const pA = ss.total ? ss.onTrack / ss.total : 0, pB = ss.total ? ss.notes / ss.total : 0, pM = ss.total ? ss.m / ss.total : 0;
  return ringSvg(size, [
    { color: 'blue', arcs: [{ p: pA }, { p: pM, start: pA, color: 'orange' }] }, // arancione sopra il blu
    { color: 'mint', arcs: [{ p: pB }] }
  ], `${ss.onTrack} lezioni in pari su ${ss.total}, ${ss.m} da recuperare, ${ss.notes} appunti sistemati`, key);
}
function navBar(active, courseId) {
  // Nel Libretto il tasto + aggiunge un esame (anche senza corsi), dopo aver scelto i CFU del corso di laurea.
  const setup = active === 'lib-setup';
  if (setup) active = 'lib';
  const lib = active === 'lib';
  const can = lib ? !setup : curCourses().length > 0;
  const tab = (id, href, on, off, label) => `<a class="tab ${active === id ? 'on' : ''}" href="${href}" ${active === id ? 'aria-current="page"' : ''}>${active === id ? on : off}${label}</a>`;
  return `<nav class="nav" aria-label="Navigazione principale">
    <div class="tabbar glass">
      ${tab('home', '#/', I.grid(), I.gridO(), 'Corsi')}
      ${tab('lib', '#/libretto', I.bookF(), I.bookO(), 'Libretto')}
      ${tab('arch', '#/archivio', I.archF(), I.archO(), 'Archivio')}
    </div>
    <button class="fab ${can ? '' : 'off'}" data-act="${lib ? 'new-exam' : 'new-lesson'}" ${courseId ? `data-id="${courseId}"` : ''} aria-label="${lib ? 'Aggiungi esame' : 'Registra lezione'}" ${can ? '' : 'disabled'}>${I.plus()}</button>
  </nav>`;
}
function semesterHead(sem) {
  const wk = sem.start && sem.start <= todayISO() ? weeksSince(sem.start) : 0;
  return `<header class="head"><h1 class="large-title">${esc(sem.title)}</h1><span class="sub">A.A. ${esc(sem.year)}${wk ? ' · Settimana ' + wk : ''} · ${fmtToday()}</span></header>`;
}
function remindBanner() {
  const st = staleNotes();
  if (!st.length) return '';
  const byCourse = {};
  st.forEach(({ c }) => { byCourse[c.id] = (byCourse[c.id] || 0) + 1; });
  const top = Object.keys(byCourse).sort((a, b) => byCourse[b] - byCourse[a])[0];
  const d = S.remindDays || 3;
  return `<button class="remind" data-act="goto-notes" data-id="${top}">
    ${I.bell(18)}<span class="rtext"><b>${st.length} ${plural(st.length, 'appunto da sistemare', 'appunti da sistemare')}</b><span>Da più di ${d} ${plural(d, 'giorno', 'giorni')}. Tocca per vederli.</span></span>${I.chev(14, 2.8)}
  </button>`;
}
// Dopo le lezioni automatiche: un controllo veloce, così le assenze non passano per presenze.
function checkinCard() {
  const P = pendingLessons();
  if (!P.length) return '';
  const dates = [...new Set(P.map((x) => x.l.date))];
  const names = [...new Set(P.map((x) => x.c.name))];
  const who = names.length > 2 ? `${names.slice(0, 2).join(', ')} e ${names.length - 2} ${plural(names.length - 2, 'altro', 'altri')}` : names.join(' e ');
  const when = dates.length === 1 ? dayName(dates[0]) : `${P.length} lezioni dal ${fmtShort(dates[0])}`;
  const q = P.length === 1 ? "L'hai seguita?" : 'Le hai seguite?';
  return `<section class="card checkin mx" aria-labelledby="ck-title">
    <div class="ck-top">${I.cal(20)}<div class="t"><span>${esc(when)} · ${esc(who)}</span><b id="ck-title">${q}</b></div></div>
    <div class="ck-btns"><button class="ck-yes" data-act="checkin-all">${I.check(15, 3)}${P.length === 1 ? 'Sì' : 'Sì, a tutte'}</button>
    <button class="ck-pick" data-act="checkin-open">${P.length === 1 ? 'No, da recuperare' : 'Segna le assenze'}</button></div>
  </section>`;
}
function welcome() {
  return `<section class="empty">
    <span class="ico">${I.folderPlus()}</span>
    <h2>Benvenuto in Procedo</h2>
    <p>Crea il semestre in corso per tenere traccia di presenze, recuperi e appunti. I dati restano solo su questo dispositivo.</p>
    <button class="pill-btn" data-act="new-sem">${I.plus(18)}Crea semestre</button>
  </section>`;
}
function noCourses() {
  return `<section class="empty" style="padding-top:60px">
    <span class="ico">${I.folderPlus()}</span>
    <h2>Nessun corso</h2>
    <p>Aggiungi i corsi del semestre per tenere traccia di presenze, recuperi e appunti.</p>
    <button class="pill-btn" data-act="new-course">${I.plus(18)}Aggiungi corso</button>
  </section>`;
}

/* ---------- Home (iPhone) ---------- */
// Icona del corso con il badge delle lezioni perse, come i badge delle app iOS.
const badged = (icon, m) => (m ? `<span class="ibadge-wrap">${icon}<span class="ibadge" aria-label="${m} da recuperare">${m}</span></span>` : icon);
function missHero(st) {
  if (!st.m) return '';
  const missed = st.L.map((l, i) => ({ l, n: i + 1 })).filter((x) => x.l.p === 'M');
  const list = missed.slice(-3).reverse().map((x) => `Lez. ${x.n} · ${fmtShort(x.l.date)}`).join(', ') + (missed.length > 3 ? '…' : '');
  return `<button class="miss-hero" data-act="filter" data-filter="miss">
    <span class="mh-num">${st.m}</span><span class="mh-txt"><b>${plural(st.m, 'lezione da recuperare', 'lezioni da recuperare')}</b><span>${list}</span></span>${I.chev(14, 2.8)}
  </button>`;
}
// Corsi con lezioni da recuperare per primi (stabile per gli altri).
const byUrgency = (list) => list.map((c, i) => ({ c, i, m: stats(c).m })).sort((a, b) => b.m - a.m || a.i - b.i).map((x) => x.c);
function courseCard(c) {
  const st = stats(c);
  const np = pct(st.done, st.total);
  const meta = [c.cfu ? c.cfu + ' CFU' : '', c.prof, daysLabel(c.days)].filter(Boolean).join(' · ') || 'Tocca per i dettagli';
  return `<article class="card course ${st.m ? 'has-miss' : ''}">
    <div class="course-head">
      ${badged(codeIcon(c, 40, 11, 14), st.m)}
      <a class="course-name" href="#/corso/${c.id}"><b>${esc(c.name)}</b><span>${esc(meta)}</span></a>
      <button class="add-lesson" data-act="new-lesson" data-id="${c.id}" aria-label="Aggiungi lezione a ${esc(c.name)}">${I.plus(15)}Lezione</button>
    </div>
    <a class="meter" href="#/corso/${c.id}">
      <div class="meter-head"><span style="color:var(--blueText)">Lezioni in pari</span><span class="big">${st.onTrack}<small> / ${st.total}</small></span></div>
      <div role="img" aria-label="${st.onTrack} lezioni in pari su ${st.total}, ${st.m} da recuperare">${segBar(st.L)}</div>
      <div class="mini-legend"><span><i class="lg" style="color:var(--blue)">${I.check(12, 3.2)}</i>${st.s} seguite</span><span><i class="lg" style="color:var(--recup)">${I.recup(12, 3)}</i>${st.r} recuperate</span><span class="${st.m ? 'miss-legend' : ''}"><i class="lg" style="color:var(--orange)">${I.warn(12)}</i>${st.m} da recuperare</span></div>
    </a>
    <a class="meter" href="#/corso/${c.id}">
      <div class="meter-head"><span style="color:var(--mintText)">Appunti sistemati</span><span class="val">${notesLabel(st)}</span></div>
      <div role="img" aria-label="${notesAria(st)}">${notesBar(np)}</div>
    </a>
    ${st.m || st.gap ? `<div class="tags">
      ${st.m ? `<button class="tag orange solid" data-act="goto-filter" data-filter="miss" data-id="${c.id}">${I.warn(12)}${st.m} da recuperare</button>` : ''}
      ${st.gap ? `<button class="tag mint" data-act="goto-filter" data-filter="notes" data-id="${c.id}">${I.doc(12)}${st.gap} ${plural(st.gap, 'appunto da sistemare', 'appunti da sistemare')}</button>` : ''}
    </div>` : ''}
  </article>`;
}
function summaryCard(courses) {
  const ss = semStats(courses);
  return `<section class="card summary mx" aria-label="Stato generale">
    <div class="summary-top">
      <button class="ring-btn" data-act="rings-help" aria-label="Cosa significano gli anelli">${ringsFor(ss, RING_SIZE, "sem")}</button>
      <div class="summary-nums">
        <div class="knum"><span class="klabel" style="color:${ss.m ? 'var(--orangeText)' : 'var(--label2)'}">${I.warn(13)}Da recuperare</span><span class="kval ${ss.m ? 'alert' : ''}">${ss.m} <small>${plural(ss.m, 'lezione', 'lezioni')}</small></span></div>
        <div class="knum"><span class="klabel" style="color:var(--mintText)">${I.doc(13)}Appunti da sistemare</span><span class="kval">${ss.gap} <small>${plural(ss.gap, 'lezione', 'lezioni')}</small></span></div>
      </div>
    </div>
    <div class="legend"><span><i class="lg" style="color:var(--blue)">${I.check(13, 3.2)}</i>${ss.onTrack} di ${ss.total} in pari</span><span><i class="lg" style="color:var(--mint)">${I.doc(13)}</i>${ss.notes} appunti sistemati</span><button class="ring-help" data-act="rings-help">${I.info(15)}Cosa significano</button></div>
  </section>`;
}
function phoneHome() {
  const sem = curSem();
  const courses = sem ? coursesOf(sem.id) : [];
  const top = `<div class="topbar end">
    ${courses.length ? '<button class="glass gbtn" data-act="conclude">Concludi semestre</button>' : ''}
    <a class="glass gbtn circle" href="#/impostazioni" aria-label="Impostazioni">${I.person()}</a>
  </div>`;
  if (!sem) return `<div class="page">${top}${welcome()}</div>${navBar('home')}`;
  if (!courses.length) return `<div class="page">${top}${semesterHead(sem)}${noCourses()}</div>${navBar('home')}`;
  return `<div class="page">${top}${semesterHead(sem)}
    ${checkinCard()}
    <h2 class="title2 sec-head first">In evidenza</h2>
    ${summaryCard(courses)}
    ${remindBanner()}
    <div class="sec-head"><h2 class="title2">Corsi</h2><span class="sub">${courses.length} ${plural(courses.length, 'attivo', 'attivi')}</span></div>
    <div class="stack mx">${byUrgency(courses).map(courseCard).join('')}</div>
    <button class="add-course" data-act="new-course">${I.plus(16)}Aggiungi corso</button>
  </div>${navBar('home')}`;
}

/* ---------- Dettaglio corso ---------- */
function lessonRow(l, n, c, ro) {
  const P = { S: ['Presente', I.check(14)], M: ['Da recuperare', I.warn(14)], R: ['Recuperata', I.recup(14)] }[l.p];
  const aria = { S: 'presente', M: 'da recuperare', R: 'recuperata' }[l.p];
  return `<li class="lrow ${l.p === 'M' ? 'miss' : ''}" data-id="${l.id}" data-course="${c.id}">
    <div class="sw-bg l"><span>${I.recup(20, 2.4)}Recuperata</span></div>
    <div class="sw-bg r"><span>${I.docCheck(20)}${l.a ? 'Da sistemare' : 'Sistemati'}</span></div>
    <div class="lrow-fg">
      <button class="lmain" data-act="edit-lesson" data-id="${l.id}" data-course="${c.id}" aria-label="Lezione ${n}, ${esc(fmtShort(l.date))}${l.topic ? ', ' + esc(l.topic) : ''}. Modifica">
        <span class="lhead"><span class="ln">Lezione ${n}</span><span class="ld">${l.chk ? esc(clean(fmtDayMonth.format(parseISO(l.date)))) + ' · <b class="chk">da confermare</b>' : fmtShort(l.date)}</span></span>
        <span class="lt ${l.topic ? '' : 'none'}">${esc(l.topic || 'Argomento non indicato')}</span>
      </button>
      <button class="pbtn ${l.p}" data-act="cycle" data-id="${l.id}" data-course="${c.id}" aria-label="Lezione ${n}: ${aria}. Tocca per cambiare stato">${P[1]}${P[0]}</button>
      <button class="abtn ${l.a ? 'on' : 'off'}" data-act="toggle-a" data-id="${l.id}" data-course="${c.id}" aria-pressed="${l.a}" aria-label="Appunti lezione ${n}: ${l.a ? 'sistemati' : 'da sistemare'}">${l.a ? I.docCheck(18) : I.docO(18)}<span class="alabel">${l.a ? 'Sistemati' : 'Da sistemare'}</span></button>
    </div>
  </li>`;
}
function courseDetail(c, wide) {
  const st = stats(c);
  const f = ui.filter;
  const meta = [c.cfu ? c.cfu + ' CFU' : '', c.prof, daysLabel(c.days)].filter(Boolean).join(' · ');
  const numbered = st.L.map((l, i) => ({ l, n: i + 1 }));
  const rows = numbered.slice().reverse().filter(({ l }) => (f === 'miss' ? l.p === 'M' : f === 'notes' ? !l.a : true));
  const filters = [['all', wide ? 'Tutte le lezioni' : 'Tutte'], ['miss', 'Da recuperare'], ['notes', 'Da sistemare']];
  let empty = '';
  if (!st.total) empty = `<li class="list-empty"><b>Nessuna lezione</b><span>${(c.days || []).length ? 'Le lezioni dei giorni in calendario si aggiungeranno da sole. Per quelle già fatte usa il tasto qui sotto.' : 'Imposta i giorni di lezione da Modifica: Procedo aggiungerà da solo le lezioni di quei giorni.'}</span></li>`;
  else if (!rows.length) empty = `<li class="list-empty"><b>Sei in pari</b><span>${f === 'miss' ? 'Nessuna lezione da recuperare.' : 'Tutti gli appunti sono sistemati.'}</span></li>`;
  return `
    <header class="chead">${codeIcon(c, 52, 14, 18)}<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h1>${esc(c.name)}</h1>${meta ? `<span class="sub">${esc(meta)}</span>` : ''}</div></header>
    <section class="card stats ${wide ? '' : 'mx'}" aria-label="Statistiche" style="${wide ? '' : 'margin-top:20px'}">
      ${missHero(st)}
      <div class="stat-grid ${wide ? 'four' : ''}">
        <div class="stat"><span>Svolte</span><b>${st.total}</b></div>
        <div class="stat"><span style="color:var(--blueText)">Presenze</span><b>${pct(st.s, st.total)}<small>%</small></b></div>
        <div class="stat"><span style="color:var(--mintText)">Appunti</span><b>${pct(st.done, st.total)}<small>%</small></b></div>
        ${wide ? `<div class="stat"><span style="color:${st.m ? 'var(--orangeText)' : 'var(--label2)'}">Da recuperare</span><b style="${st.m ? 'color:var(--orangeText)' : ''}">${st.m}</b></div>` : ''}
      </div>
      <div class="meter" style="gap:7px"><div class="meter-head"><span style="color:var(--blueText)">Lezioni in pari</span><span class="val">${st.onTrack} / ${st.total}</span></div>${segBar(st.L)}</div>
      <div class="meter" style="gap:7px"><div class="meter-head"><span style="color:var(--mintText)">Appunti sistemati</span><span class="val">${st.total && st.done === st.total ? 'Tutti sistemati' : notesLabel(st)}</span></div><div role="img" aria-label="${notesAria(st)}">${notesBar(pct(st.done, st.total))}</div>${notesNext(st) ? `<span class="meter-sub">${notesNext(st)}</span>` : ''}</div>
    </section>
    <div class="seg ${wide ? '' : 'mx'}" role="group" aria-label="Filtra lezioni" style="${wide ? '' : 'margin-top:20px'}">
      ${filters.map(([id, lb]) => `<button aria-pressed="${f === id}" class="${f === id ? 'on' : ''}" data-act="filter" data-filter="${id}">${lb}</button>`).join('')}
    </div>
    ${wide ? '' : '<h2 class="sec-label">Lezioni · dalla più recente</h2>'}
    <div class="lessons ${wide ? '' : 'mx'}"><ol class="list">${rows.map(({ l, n }) => lessonRow(l, n, c)).join('')}${empty}</ol></div>
    <button class="add-course past-btn ${wide ? '' : 'mx-btn'}" data-act="past" data-id="${c.id}">${I.cal(16)}Aggiungi lezioni passate</button>
    ${st.total ? `<p class="foot">Tocca lo stato per cambiarlo, tocca la lezione per modificarla. Scorri a destra per “Recuperata”, a sinistra per “Appunti sistemati”.</p>` : ''}`;
}
function phoneCourse(c) {
  return `<div class="page">
    <div class="topbar between">
      <a class="glass gbtn circle" href="#/" aria-label="Indietro: Corsi">${I.back()}</a>
      <button class="glass gbtn" style="padding:0 18px" data-act="edit-course" data-id="${c.id}">Modifica</button>
    </div>
    ${courseDetail(c, false)}
  </div>${navBar('home', c.id)}`;
}

/* ---------- Archivio ---------- */
function archiveGroups() {
  const arch = S.semesters.filter((s) => s.status === 'archived' && coursesOf(s.id).length);
  const years = {};
  arch.forEach((s) => { (years[s.year] = years[s.year] || []).push(s); });
  return Object.keys(years).sort().reverse().map((y) => ({ year: y, sems: years[y].sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0)) }));
}
function archiveBody() {
  const groups = archiveGroups();
  const head = `<header class="head" style="padding-top:${wideMQ.matches ? 4 : 8}px"><h1 class="large-title">Archivio</h1><span class="sub">Semestri conclusi, in sola lettura</span></header>`;
  if (!groups.length) {
    return head + `<section class="empty" style="padding-top:70px"><span class="ico">${I.archO(64)}</span><h2>Archivio vuoto</h2><p>Quando concludi un semestre, i suoi corsi finiscono qui in sola lettura.</p></section>`;
  }
  return head + groups.map((g) => `
    <h2 class="sec-label" style="margin-top:24px">A.A. ${esc(g.year)}</h2>
    <div class="stack mx">${g.sems.map((s) => {
      const cs = coursesOf(s.id);
      const isOpen = ui.open[s.id] !== false;
      const cfu = cs.reduce((a, c) => a + (Number(c.cfu) || 0), 0);
      return `<div class="card agroup">
        <button class="agroup-btn" data-act="toggle-group" data-id="${s.id}" aria-expanded="${isOpen}">
          <span class="t"><b>${esc(s.title)}</b><span>${cs.length} ${plural(cs.length, 'corso', 'corsi')}${cfu ? ' · ' + cfu + ' CFU' : ''}</span></span>${I.chev(18, 2.6, 'chev')}
        </button>
        ${isOpen ? `<ul class="alist">${cs.map((c) => {
          const st = stats(c);
          return `<li><a href="#/archivio/${c.id}">${codeIcon(c, 32, 9, 11)}<span class="t"><b>${esc(c.name)}</b><span class="${st.m ? 'warn' : ''}">${st.total} ${plural(st.total, 'lezione', 'lezioni')} · ${st.m ? st.m + ' mai ' + plural(st.m, 'recuperata', 'recuperate') : 'in pari'}</span></span>${I.chev(14, 2.8, 'chev')}</a></li>`;
        }).join('')}</ul>` : ''}
      </div>`;
    }).join('')}</div>`).join('');
}
function phoneArchive() {
  return `<div class="page"><div class="topbar"></div>${archiveBody()}</div>${navBar('arch')}`;
}
// Esame del corso nel Libretto: lo mostra se c'è, altrimenti propone di registrarlo già collegato.
function courseExamLink(c) {
  const e = S.exams.find((x) => x.courseId === c.id);
  if (!e) return `<button class="add-course" data-act="new-exam" data-course="${c.id}">${I.bookO(18)}Registra l'esame nel Libretto</button>`;
  const what = e.status !== 'passed' ? 'Da sostenere' : e.kind === 'idoneita' ? 'Idoneo' : 'Voto ' + gradeLabel(e.grade);
  return `<h2 class="sec-label">Esame</h2><ul class="list mx exlist"><li class="exrow"><button class="ex-main" data-act="edit-exam" data-id="${e.id}">${I.bookF(22)}<span class="t"><b>${esc(what)}</b><span>Nel Libretto${e.cfu ? ' · ' + e.cfu + ' CFU' : ''}</span></span></button><a class="ex-go" href="#/libretto">Apri${I.chev(12, 2.8)}</a></li></ul>`;
}
function archCourseBody(c, withBar) {
  const st = stats(c);
  const sem = semById(c.semId);
  const meta = [sem ? `${sem.title} ${sem.year}` : '', c.cfu ? c.cfu + ' CFU' : ''].filter(Boolean).join(' · ');
  const ST = { S: 'Presente', M: 'Mai recuperata', R: 'Recuperata' };
  const rows = st.L.map((l, i) => ({ l, n: i + 1 })).reverse();
  return `
    ${withBar ? `<div class="topbar between"><a class="glass gbtn circle" href="#/archivio" aria-label="Indietro: Archivio">${I.back()}</a><span class="ro-badge">${I.lock()}Sola lettura</span></div>` : ''}
    <header class="chead" style="padding-top:10px">${codeIcon(c, 52, 14, 18)}<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><h1>${esc(c.name)}</h1><span class="sub">${esc(meta)}</span></div></header>
    <section class="card stats mx" style="margin-top:18px;gap:14px">
      <div class="meter" style="gap:7px"><div class="meter-head"><span style="color:var(--blueText)">Lezioni in pari</span><span class="val">${st.onTrack} / ${st.total}</span></div>${segBar(st.L)}</div>
      <div class="meter" style="gap:7px"><div class="meter-head"><span style="color:var(--mintText)">Appunti sistemati</span><span class="val">${notesLabel(st)}</span></div>${notesBar(pct(st.done, st.total), false)}</div>
      <button class="restore" data-act="restore" data-id="${c.id}">${I.restore()}Ripristina nel semestre attuale</button>
    </section>
    ${courseExamLink(c)}
    <div class="sec-label" style="display:flex;justify-content:space-between;align-items:baseline"><span>Storico lezioni</span>${st.m ? `<span style="text-transform:none;font-weight:600;color:var(--orangeText)">${st.m} mai ${plural(st.m, 'recuperata', 'recuperate')}</span>` : ''}</div>
    <ol class="list mx">${rows.map(({ l, n }) => `<li class="rorow"><div class="t"><b>Lezione ${n}</b><span>${esc(clean(fmtDayMonth.format(parseISO(l.date))))}${l.topic ? ' · ' + esc(l.topic) : ''}</span></div><span class="ropill ${l.p}">${ST[l.p]}</span></li>`).join('') || '<li class="list-empty"><span>Nessuna lezione registrata.</span></li>'}</ol>
    <button class="text-btn" data-act="delete-course" data-id="${c.id}">Elimina dall'archivio</button>`;
}

/* ---------- Libretto ---------- */
function examRow(e) {
  const look = examLook(e);
  const k = Number(e.cfu) || 0;
  const info = e.status === 'passed'
    ? [e.date ? clean(fmtDayMonth.format(parseISO(e.date))) + ' ' + e.date.slice(0, 4) : '', k ? k + ' CFU' : ''].filter(Boolean).join(' · ')
    : (k ? k + ' CFU' : 'CFU non indicati') + (e.kind === 'idoneita' ? ' · idoneità' : '');
  let right;
  if (e.status === 'passed') {
    right = e.kind === 'idoneita' ? '<span class="grade ido">Idoneo</span>' : `<span class="grade ${e.grade === 31 ? 'lode' : ''}">${gradeLabel(e.grade)}</span>`;
  } else if (e.kind === 'idoneita') {
    right = '';
  } else {
    // Voto ipotetico per la simulazione: pulsante a comparsa come i menu pop-up di iOS.
    right = `<label class="popup ${e.sim ? 'on' : ''}"><select data-field="sim" data-id="${e.id}" aria-label="Voto ipotetico per ${esc(e.name)}">
      <option value="">Simula</option>${GRADES.map((g) => `<option value="${g}" ${e.sim === g ? 'selected' : ''}>${gradeLabel(g)}</option>`).join('')}</select>${I.updown()}</label>`;
  }
  return `<li class="exrow"><button class="ex-main" data-act="edit-exam" data-id="${e.id}">${codeIcon(look, 36, 10, 13)}<span class="t"><b>${esc(e.name)}</b><span>${esc(info)}</span></span></button>${right}</li>`;
}
// Anello dei CFU del Libretto: stesso componente e stessa misura degli anelli della scheda Corsi.
function cfuRing(cfu, total, key) {
  return ringSvg(RING_SIZE, [{ color: 'mint', arcs: [{ p: total ? cfu / total : 0 }] }], '', key);
}
function libSummary(st) {
  const total = Number(S.degreeCfu) || 0;
  const done = total && st.cfu >= total;
  return `<section class="card lib-sum mx" aria-label="CFU e media">
    <button class="lib-ring" data-act="edit-degree" aria-label="${st.cfu} CFU acquisiti su ${total}. Tocca per cambiare i CFU del corso di laurea">
      ${cfuRing(st.cfu, total, "cfu")}
      <span class="ring-center">${done ? I.check(30, 3.4) : `<b>${st.cfu}</b><span>di ${total} CFU</span>`}</span>
    </button>
    <div class="lib-nums">
      <div class="knum"><span class="klabel" style="color:var(--blueText)">Media ponderata</span><span class="lib-big">${st.avg != null ? fmtNum(st.avg) : '–'}</span></div>
      <div class="knum"><span class="klabel">Base di laurea</span><span class="kval">${st.avg != null ? fmtNum(st.avg * 110 / 30, 1) : '–'} <small>/ 110</small></span></div>
      <div class="knum"><span class="klabel">Media aritmetica</span><span class="kval">${st.arith != null ? fmtNum(st.arith) : '–'}</span></div>
    </div>
  </section>`;
}
const DEGREES = [[180, 'Laurea triennale', '3 anni'], [120, 'Laurea magistrale', '2 anni'], [300, 'Magistrale a ciclo unico', '5 anni'], [360, 'Magistrale a ciclo unico', '6 anni']];
// Primo avvio del Libretto: prima di tutto serve il totale dei CFU del corso di laurea.
function degreeSetup() {
  return `<section class="lib-setup">
      <span class="lib-ring">${cfuRing(0, 0, "setup")}<span class="ring-center">${I.bookF(34)}</span></span>
      <h2>Quanti CFU vale il tuo corso di laurea?</h2>
      <p>Serve a chiudere l'anello dei CFU e a calcolare il voto che ti serve per la media che vuoi. Puoi cambiarlo quando vuoi.</p>
    </section>
    <ul class="slist">${DEGREES.map(([v, t, y]) => `<li><button class="srow" data-act="set-degree" data-value="${v}"><span class="sbody"><span class="dg"><b>${t}</b><small>${y}</small></span><span class="v">${v} CFU${I.chev(14, 2.8)}</span></span></button></li>`).join('')}
      <li><button class="srow" data-act="edit-degree"><span class="sbody">Altro<span class="v">${I.chev(14, 2.8)}</span></span></button></li>
    </ul>`;
}
function libSimulation(st, todo) {
  if (!todo.some((e) => e.kind !== 'idoneita')) return '';
  const sim = libStats(true);
  const used = todo.filter((e) => e.sim && e.kind !== 'idoneita').length;
  if (!used) return `<p class="foot">Scegli un voto in “Simula” accanto agli esami da sostenere per vedere come cambierebbe la media.</p>`;
  const diff = st.avg != null ? sim.avg - st.avg : null;
  const sign = diff == null ? '' : diff > 0.004 ? 'up' : diff < -0.004 ? 'down' : '';
  return `<section class="card sim-card mx" aria-label="Simulazione">
    <span class="sim-ico">${I.wand(18)}</span>
    <div class="t"><span>Con ${used} ${plural(used, 'voto simulato', 'voti simulati')}</span><b>${fmtNum(sim.avg)}${diff != null ? ` <small class="${sign}">${diff >= 0 ? '+' : '−'}${fmtNum(Math.abs(diff))}</small>` : ''}</b><span>Base di laurea ${fmtNum(sim.avg * 110 / 30, 1)}</span></div>
    <button class="gbtn sim-reset" data-act="clear-sim">Azzera</button>
  </section>`;
}
function libTarget() {
  const ti = targetInfo();
  if (!ti) {
    return `<button class="card target-card mx" data-act="edit-target"><span class="sicon" style="background:#FF8D28">${I.target()}</span><span class="t"><b>Imposta una media obiettivo</b><span>Ti dico che voto ti serve negli esami che mancano</span></span>${I.chev(14, 2.8)}</button>`;
  }
  let big, msg, cls = '';
  if (!ti.left) { big = ti.avg != null ? fmtNum(ti.avg) : '–'; msg = 'Hai già tutti i CFU del corso di laurea: questa è la tua media finale.'; }
  else if (ti.need <= 18) { big = '18'; cls = 'ok'; msg = `Obiettivo al sicuro: ti basta superare gli esami dei ${ti.left} CFU che mancano.`; }
  else if (ti.need > 30) { big = fmtNum(ti.need, 1); cls = 'bad'; msg = `Non raggiungibile: anche con tutti 30 nei ${ti.left} CFU che mancano arrivi a ${fmtNum(ti.max)}.`; }
  else { big = fmtNum(ti.need, 1); msg = `È il voto medio che ti serve nei ${ti.left} CFU che mancano.`; }
  return `<button class="card target-card mx" data-act="edit-target"><span class="sicon" style="background:#FF8D28">${I.target()}</span>
    <span class="t"><span class="lbl">Obiettivo ${fmtNum(ti.t)}</span><b class="need ${cls}">${big}</b><span>${msg}</span></span>${I.chev(14, 2.8)}</button>`;
}
function librettoBody() {
  const head = (sub) => `<header class="head" style="padding-top:${wideMQ.matches ? 4 : 8}px"><h1 class="large-title">Libretto</h1><span class="sub">${sub}</span></header>`;
  if (!S.degreeSet) return head('Esami, media e obiettivo') + degreeSetup();
  const st = libStats(false);
  if (!S.exams.length) {
    return head(`Corso di laurea da ${S.degreeCfu} CFU`) + `<div style="margin-top:18px">${libSummary(st)}</div>
      <section class="empty" style="padding-top:28px"><h2>Nessun esame</h2>
      <p>Aggiungi gli esami superati con voto e CFU: l'anello si chiude man mano. Puoi inserire anche quelli da sostenere per simulare i voti.</p>
      <button class="pill-btn" data-act="new-exam">${I.plus(18)}Aggiungi esame</button></section>`;
  }
  const passed = S.exams.filter((e) => e.status === 'passed').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const todo = S.exams.filter((e) => e.status !== 'passed');
  return head(`${st.passed} ${plural(st.passed, 'esame superato', 'esami superati')} · ${st.cfu} CFU`) + `
    <div style="margin-top:18px">${libSummary(st)}</div>
    <h2 class="sec-label">Obiettivo</h2>${libTarget()}
    ${todo.length ? `<div class="sec-label sec-row"><span>Da sostenere · ${todo.length}</span></div>${libSimulation(st, todo)}<ul class="list mx exlist" style="margin-top:${todo.some((e) => e.sim) ? 12 : 8}px">${todo.map(examRow).join('')}</ul>` : ''}
    ${passed.length ? `<h2 class="sec-label">Superati · ${passed.length}</h2><ul class="list mx exlist">${passed.map(examRow).join('')}</ul>` : ''}
    <button class="add-course" data-act="new-exam">${I.plus(16)}Aggiungi esame</button>
    <p class="foot">Il 30 e lode vale 30 nella media. Gli esami a idoneità contano nei CFU ma non nella media.</p>`;
}
function phoneLibretto() {
  return `<div class="page"><div class="topbar end"><a class="glass gbtn circle" href="#/impostazioni" aria-label="Impostazioni">${I.person()}</a></div>${librettoBody()}</div>${navBar(S.degreeSet ? 'lib' : 'lib-setup')}`;
}

/* ---------- Impostazioni ---------- */
function settingsBody() {
  const sem = curSem();
  const opts = [
    { id: 'chiaro', label: 'Chiaro', l: ['#F2F2F7', '#000000', '#FFFFFF', '#0088FF', '#FF8D28'] },
    { id: 'scuro', label: 'Scuro', l: ['#000000', '#FFFFFF', '#1C1C1E', '#0A84FF', '#FF9F0A'] },
    { id: 'automatico', label: 'Automatico', l: ['#F2F2F7', '#000000', '#FFFFFF', '#0088FF', '#FF8D28'], split: true }
  ];
  const half = (p) => `<span style="background:${p[0]}"><i style="height:7px;width:70%;border-radius:3px;background:${p[1]}"></i><i style="height:34px;background:${p[2]};padding:5px;display:flex;flex-direction:column;gap:4px"><i style="height:4px;border-radius:2px;background:${p[3]}"></i><i style="height:4px;width:55%;border-radius:2px;background:${p[4]}"></i></i><i style="height:34px;background:${p[2]}"></i><i style="margin-top:auto;height:12px;border-radius:6px;background:${p[2]}"></i></span>`;
  const dark = ['#000000', '#FFFFFF', '#1C1C1E', '#0A84FF', '#FF9F0A'];
  return `
    <h1 class="large-title" style="margin:6px 20px 0">Impostazioni</h1>
    <h2 class="sec-label" id="aspetto">Aspetto</h2>
    <section class="card mx" aria-labelledby="aspetto"><div class="themes" role="radiogroup" aria-label="Tema">
      ${opts.map((o) => `<button class="theme-opt ${S.theme === o.id ? 'on' : ''}" role="radio" aria-checked="${S.theme === o.id}" data-act="theme" data-id="${o.id}">
        <span class="theme-prev" aria-hidden="true">${half(o.l)}${o.split ? half(dark) : ''}</span>${o.label}
        <span class="radio-dot">${S.theme === o.id ? I.check(13, 3.4) : ''}</span></button>`).join('')}
    </div></section>
    <p class="foot">“Automatico” segue l'aspetto chiaro o scuro scelto in iOS e iPadOS.</p>

    <h2 class="sec-label" id="semestre">Semestre</h2>
    <ul class="slist" aria-labelledby="semestre">
      <li><button class="srow" data-act="${sem ? 'edit-sem' : 'new-sem'}"><span class="sicon" style="background:#0088FF">${I.cal()}</span><span class="sbody">Semestre attuale<span class="v">${sem ? esc((sem.title.match(/^\S+/) || [''])[0] + ' · ' + shortYear(sem.year)) : 'Nessuno'}${I.chev(14, 2.8)}</span></span></button></li>
      <li><div class="srow"><span class="sicon" style="background:#34C759">${I.cal()}</span><span class="sbody"><label for="auto">Lezioni automatiche</label><button id="auto" class="switch" role="switch" aria-checked="${S.auto !== false}" data-act="toggle-auto"><span></span></button></span></div></li>
      ${S.auto !== false ? `<li><div class="srow"><span class="sicon" style="background:#8E8E93">${I.check(16, 2.6)}</span><span class="sbody"><label for="autop">Segna come</label><select id="autop" class="sselect" data-field="autoP"><option value="S" ${S.autoP !== 'M' ? 'selected' : ''}>Presente</option><option value="M" ${S.autoP === 'M' ? 'selected' : ''}>Da recuperare</option></select></span></div></li>` : ''}
      <li><div class="srow"><span class="sicon" style="background:#FF383C">${I.bell()}</span><span class="sbody"><label for="promemoria">Promemoria appunti</label><button id="promemoria" class="switch" role="switch" aria-checked="${!!S.remind}" data-act="toggle-remind"><span></span></button></span></div></li>
      ${S.remind ? `<li><div class="srow"><span class="sicon" style="background:#8E8E93">${I.clock()}</span><span class="sbody"><label for="rdays">Avvisa dopo</label><select id="rdays" class="sselect" data-field="remindDays">${[1, 2, 3, 5, 7, 14].map((d) => `<option value="${d}" ${S.remindDays === d ? 'selected' : ''}>${d} ${plural(d, 'giorno', 'giorni')}</option>`).join('')}</select></span></div></li>` : ''}
      ${sem && curCourses().length ? `<li><button class="srow" data-act="conclude"><span class="sicon" style="background:#FF8D28">${I.box()}</span><span class="sbody">Concludi semestre<span class="v">${I.chev(14, 2.8)}</span></span></button></li>` : ''}
    </ul>
    <p class="foot">Con le lezioni automatiche, ogni giorno di lezione del corso compare da solo nella lista: se l'hai saltata tocca lo stato. Se elimini una lezione (es. vacanza) non viene ricreata. Il promemoria mostra un avviso nella Home quando hai appunti non sistemati da più giorni.</p>

    <h2 class="sec-label" id="libretto">Libretto</h2>
    <ul class="slist" aria-labelledby="libretto">
      <li><button class="srow" data-act="edit-degree"><span class="sicon" style="background:#00C8B3">${I.bookF(18)}</span><span class="sbody">Corso di laurea<span class="v">${S.degreeSet ? S.degreeCfu + ' CFU' : 'Da scegliere'}${I.chev(14, 2.8)}</span></span></button></li>
      <li><button class="srow" data-act="edit-target"><span class="sicon" style="background:#FF8D28">${I.target(18)}</span><span class="sbody">Media obiettivo<span class="v">${S.target ? fmtNum(S.target) : 'Nessuna'}${I.chev(14, 2.8)}</span></span></button></li>
    </ul>

    <h2 class="sec-label" id="dati">Dati</h2>
    <ul class="slist" aria-labelledby="dati">
      <li><button class="srow" data-act="export"><span class="sicon" style="background:#34C759">${I.share()}</span><span class="sbody">Esporta backup<span class="v">${I.chev(14, 2.8)}</span></span></button></li>
      <li><button class="srow" data-act="import"><span class="sicon" style="background:#6155F5">${I.download()}</span><span class="sbody">Importa backup<span class="v">${I.chev(14, 2.8)}</span></span></button></li>
      <li><button class="srow" data-act="wipe"><span class="sicon" style="background:#8E8E93">${I.trash()}</span><span class="sbody danger">Cancella tutti i dati</span></button></li>
    </ul>
    <p class="foot">Il backup è un file .json: salvalo in File o iCloud Drive per recuperare i dati se cambi dispositivo.</p>
    <p class="about">Procedo · funziona offline<br>I dati sono salvati solo su questo dispositivo.</p>`;
}
function phoneSettings() {
  return `<div class="page no-nav"><div class="topbar"><a class="glass gbtn circle" href="#/" aria-label="Indietro">${I.back()}</a></div>${settingsBody()}</div>`;
}

/* ---------- iPad: Split View ---------- */
function sideOpen() { return ui.side == null ? window.innerWidth >= 1100 : ui.side; }
function wideCard(c, sel) {
  const st = stats(c);
  return `<a class="wcard ${sel ? 'on' : ''}" href="#/corso/${c.id}" aria-current="${sel}">
    <span class="r1">${badged(codeIcon(c, 30, 8, 11), st.m)}<span class="nm">${esc(c.name)}</span><b>${st.onTrack}<small> / ${st.total}</small></b></span>
    ${segBar(st.L, 7)}
    ${notesBar(pct(st.done, st.total), false, 7)}
    <span class="r3"><span>${!st.total ? 'Nessuna lezione' : st.done === st.total ? 'Appunti: tutti sistemati' : `Appunti ${st.done} su ${st.total}`}</span>${st.m ? `<b class="miss-pill">${I.warn(11)}${st.m} da recuperare</b>` : '<b style="color:var(--blueText)">In pari</b>'}</span>
  </a>`;
}
function viewWide(r) {
  const sem = curSem();
  const courses = sem ? coursesOf(sem.id) : [];
  const onSemester = r.name === 'home' || r.name === 'corso';
  let selId = r.name === 'corso' ? r.id : ui.sel;
  if (!courses.some((c) => c.id === selId)) selId = courses[0] ? courses[0].id : null;
  ui.sel = selId;
  const sel = selId ? courseById(selId) : null;
  const open = sideOpen();
  const side = open ? `<aside class="wside glass" aria-label="Barra laterale">
    <div class="wside-top"><button class="icon-btn" data-act="toggle-side" aria-label="Nascondi barra laterale">${I.sidebar()}</button></div>
    <span class="brand">Procedo</span>
    <span class="grp">${sem ? esc(sem.title) : 'Semestre attuale'}</span>
    ${courses.map((c) => { const m = stats(c).m; const on = onSemester && c.id === selId; return `<a class="sitem ${on ? 'on' : ''}" href="#/corso/${c.id}" ${on ? 'aria-current="page"' : ''}>${codeIcon(c, 28, 8, 11)}<span class="nm">${esc(c.name)}</span>${m ? `<span class="sbadge">${m}</span>` : ''}</a>`; }).join('')}
    ${sem ? `<button class="sitem add" data-act="new-course"><span class="ib">${I.plus(20, 2.4)}</span>Aggiungi corso</button>` : ''}
    <span class="grp lib">Libreria</span>
    <a class="sitem ${r.name === 'lib' ? 'on' : ''}" href="#/libretto"><span class="ib" style="color:${r.name === 'lib' ? 'inherit' : 'var(--blue)'}">${I.bookF(22)}</span>Libretto</a>
    <a class="sitem ${r.name === 'archivio' || r.name === 'arch-corso' ? 'on' : ''}" href="#/archivio"><span class="ib" style="color:${r.name.startsWith('arch') ? 'inherit' : 'var(--blue)'}">${I.archF(22)}</span>Archivio</a>
    <div class="bottom"><a class="sitem ${r.name === 'settings' ? 'on' : ''}" href="#/impostazioni"><span class="ib" style="color:${r.name === 'settings' ? 'inherit' : 'var(--label2)'}">${I.sliders()}</span>Impostazioni</a></div>
  </aside>` : '';
  const toggle = open ? '' : `<button class="glass gbtn circle" data-act="toggle-side" aria-label="Mostra barra laterale">${I.sidebar()}</button>`;
  let top = toggle + '<span class="fill"></span>';
  let body;
  if (onSemester) {
    if (courses.length) {
      top += `<div class="gseg glass"><button data-act="conclude">Concludi semestre</button><i></i><button data-act="past" data-id="${selId}">Lezioni passate</button><i></i><button data-act="edit-course" data-id="${selId}">Modifica corso</button></div>
        <button class="blue-pill" data-act="new-lesson" data-id="${selId}">${I.plus(18)}Lezione</button>`;
    } else if (!open) {
      top += `<a class="glass gbtn circle" href="#/impostazioni" aria-label="Impostazioni">${I.person()}</a>`;
    }
    if (!sem) body = `<div class="wsingle">${welcome()}</div>`;
    else if (!courses.length) body = `<div class="wsingle"><div class="inner">${semesterHead(sem)}${noCourses()}</div></div>`;
    else body = `<div class="wcols">
      <section class="wover" data-scroll="over" aria-label="Panoramica">
        ${semesterHead(sem).replace('class="head"', 'class="head" style="padding:4px 4px 6px"')}
        ${checkinCard().replace('card checkin mx', 'card checkin')}
        <div class="card wsum"><button class="ring-btn" data-act="rings-help" aria-label="Cosa significano gli anelli">${ringsFor(semStats(courses), 104, "sem")}</button><div class="summary-nums" style="gap:10px">
          <div class="knum"><span class="klabel" style="color:${semStats(courses).m ? 'var(--orangeText)' : 'var(--label2)'}">Da recuperare</span><span class="kval ${semStats(courses).m ? 'alert' : ''}">${semStats(courses).m} <small>lezioni</small></span></div>
          <div class="knum"><span class="klabel" style="color:var(--mintText)">Appunti da sistemare</span><span class="kval">${semStats(courses).gap} <small>lezioni</small></span></div>
        </div></div>
        ${remindBanner()}
        ${byUrgency(courses).map((c) => wideCard(c, c.id === selId)).join('')}
      </section>
      <section class="wdetail" data-scroll="detail" aria-label="Dettaglio corso">${sel ? courseDetail(sel, true) : ''}</section>
    </div>`;
  } else if (r.name === 'lib') {
    if (S.degreeSet) top += `<button class="blue-pill" data-act="new-exam">${I.plus(18)}Esame</button>`;
    body = `<div class="wsingle" data-scroll="single"><div class="inner">${librettoBody()}</div></div>`;
  } else if (r.name === 'archivio') {
    body = `<div class="wsingle" data-scroll="single"><div class="inner">${archiveBody()}</div></div>`;
  } else if (r.name === 'arch-corso') {
    const c = courseById(r.id);
    top = toggle + `<a class="glass gbtn circle" href="#/archivio" aria-label="Indietro: Archivio">${I.back()}</a><span class="fill"></span><span class="ro-badge">${I.lock()}Sola lettura</span>`;
    body = `<div class="wsingle" data-scroll="single"><div class="inner">${c ? archCourseBody(c, false) : ''}</div></div>`;
  } else {
    body = `<div class="wsingle" data-scroll="single"><div class="inner page no-nav">${settingsBody()}</div></div>`;
  }
  return `<div class="wshell">${side}<div class="wmain"><div class="wtop">${top}</div>${body}</div></div>`;
}

/* ---------- Fogli ---------- */
function sheetHead(title, okAct, okDisabled, okLabel) {
  return `<div class="sheet-head">
    <button class="gbtn circle close" data-act="close-sheet" aria-label="Chiudi">${I.close()}</button>
    <h2 id="sheet-title">${title}</h2>
    ${okAct ? `<button class="gbtn circle ok" data-act="${okAct}" aria-label="${okLabel || 'Salva'}" ${okDisabled ? 'disabled' : ''}>${I.check(18)}</button>` : '<span class="spacer"></span>'}
  </div>`;
}
function sseg(field, options, value) {
  return `<div class="sseg" role="radiogroup">${options.map(([v, label, color, icon]) => `<button role="radio" aria-checked="${value === v}" class="${value === v ? 'on ' + color : ''}" data-act="sfield" data-field="${field}" data-value="${v}">${icon || ''}${label}</button>`).join('')}</div>`;
}
function sheetLesson(s) {
  const courses = curCourses();
  const c = courseById(s.courseId);
  const isNew = s.mode === 'new';
  let n = 1;
  if (c) {
    if (isNew) n = c.lessons.filter((l) => l.date <= s.date).length + 1;
    else n = sortedLessons(c).findIndex((l) => l.id === s.lessonId) + 1;
  }
  const pres = isNew
    ? [['S', 'Sì, presente', 'blue', I.check(14)], ['M', 'Da recuperare', 'orange', I.warn(13)]]
    : [['S', 'Presente', 'blue', I.check(14)], ['M', 'Da recuperare', 'orange', I.warn(13)], ['R', 'Recuperata', 'blue', I.recup(14)]];
  return `${sheetHead(isNew ? 'Nuova lezione' : 'Modifica lezione', 'save-lesson', !c)}
    ${isNew ? `<div class="chips" role="radiogroup" aria-label="Corso">${courses.map((x) => `<button class="chip ${x.id === s.courseId ? 'on' : ''}" role="radio" aria-checked="${x.id === s.courseId}" data-act="sfield" data-field="courseId" data-value="${x.id}">${codeIcon(x, 28, 14, 11)}${esc(x.name)}</button>`).join('')}</div>` : ''}
    <div class="group">
      <div class="grow"><span>Lezione ${n}</span><input class="date-in" type="date" data-field="date" value="${s.date}" max="${todayISO()}" aria-label="Data della lezione"></div>
      <div class="grow"><input type="text" data-field="topic" placeholder="Argomento (opzionale)" aria-label="Argomento (opzionale)" value="${esc(s.topic)}" enterkeyhint="done" autocomplete="off"></div>
    </div>
    <div class="fgroup"><span class="field-label">L'hai seguita?</span>${sseg('p', pres, s.p)}</div>
    <div class="fgroup"><span class="field-label">Appunti</span>${sseg('a', [['0', 'Da sistemare', 'plain'], ['1', isNew ? 'Già sistemati' : 'Sistemati', 'mint']], s.a ? '1' : '0')}</div>
    ${isNew ? `<button class="link-btn" data-act="past" data-id="${s.courseId}">${I.cal(16)}Devi segnare più lezioni già fatte? Aggiungile in un colpo</button>` : '<button class="danger-btn" data-act="delete-lesson">Elimina lezione</button>'}`;
}
function dayPicker(days) {
  return `<div class="days" role="group" aria-label="Giorni di lezione">${WEEKDAYS.map((d) => `<button class="day ${days.includes(d) ? 'on' : ''}" aria-pressed="${days.includes(d)}" aria-label="${DAY_LONG[d]}" data-act="toggle-day" data-value="${d}">${DAY_LETTER[d]}</button>`).join('')}</div>`;
}
function sheetPast(s) {
  const c = courseById(s.courseId);
  const dates = s.days.length ? pastDates(s.days, s.weeks) : [];
  const have = new Set(c.lessons.map((l) => l.date));
  const add = dates.filter((d) => !have.has(d));
  const from = isoOf(addDays(mondayOf(new Date()), -7 * (s.weeks - 1)));
  const start = semStart(semById(c.semId));
  const sinceStart = start <= todayISO() ? clampWeeks(weeksSince(start)) : 0;
  let sum;
  if (!s.days.length) sum = 'Scegli i giorni in cui hai lezione.';
  else if (!add.length) sum = 'Nessuna lezione nuova in questo periodo.';
  else sum = `<b>${add.length} ${plural(add.length, 'lezione da aggiungere', 'lezioni da aggiungere')}</b>`;
  if (dates.length > add.length) sum += ` · ${dates.length - add.length} già ${plural(dates.length - add.length, 'registrata', 'registrate')}`;
  return `${sheetHead('Lezioni passate', 'save-past', !add.length, 'Aggiungi')}
    <div class="past-course">${codeIcon(c, 40, 11, 14)}<div><b>${esc(c.name)}</b><span>Segna in un colpo le lezioni già svolte</span></div></div>
    <div class="fgroup"><span class="field-label">Giorni di lezione</span>${dayPicker(s.days)}</div>
    <div class="fgroup"><span class="field-label">Settimane già trascorse</span>
      <div class="group">
        <div class="grow"><span class="step-label"><b>${s.weeks} ${plural(s.weeks, 'settimana', 'settimane')}</b><small>dal ${fmtShort(from)} a oggi</small></span>
          <span class="stepper"><button data-act="weeks" data-value="-1" aria-label="Una settimana in meno" ${s.weeks <= 1 ? 'disabled' : ''}>−</button><i></i><button data-act="weeks" data-value="1" aria-label="Una settimana in più" ${s.weeks >= MAX_WEEKS ? 'disabled' : ''}>+</button></span></div>
        ${sinceStart && sinceStart !== s.weeks ? `<button class="grow link-row" data-act="weeks-set" data-value="${sinceStart}">Dall'inizio del semestre (${fmtShort(start)}) · ${sinceStart} ${plural(sinceStart, 'settimana', 'settimane')}</button>` : ''}
      </div>
    </div>
    <p class="past-sum">${sum}</p>
    <div class="fgroup"><span class="field-label">Le hai seguite?</span>${sseg('p', [['S', 'Sì, tutte', 'blue', I.check(14)], ['M', 'Da recuperare', 'orange', I.warn(13)]], s.p)}</div>
    <div class="fgroup"><span class="field-label">Appunti</span>${sseg('a', [['0', 'Da sistemare', 'plain'], ['1', 'Già sistemati', 'mint']], s.a ? '1' : '0')}</div>
    <p class="sheet-note">Le date che hai già registrato non vengono duplicate. Dopo puoi correggere ogni lezione dalla lista: tocca lo stato o scorri la riga.</p>`;
}
function sheetCourse(s) {
  const ok = s.name.trim().length > 0;
  const preview = { tint: s.tint, code: s.code || autoCode(s.name) || '?' };
  return `${sheetHead(s.mode === 'new' ? 'Nuovo corso' : 'Modifica corso', 'save-course', !ok)}
    <div class="course-prev" id="course-prev">${codeIcon(preview, 64, 18, 22)}</div>
    <div class="group">
      <div class="grow"><input type="text" data-field="name" placeholder="Nome del corso" aria-label="Nome del corso" value="${esc(s.name)}" autocomplete="off" enterkeyhint="next"></div>
      <div class="grow"><label for="f-code">Sigla</label><input id="f-code" class="right" type="text" data-field="code" maxlength="3" placeholder="${esc(autoCode(s.name) || 'AM')}" value="${esc(s.code)}" autocomplete="off" autocapitalize="characters"></div>
      <div class="grow"><label for="f-prof">Docente</label><input id="f-prof" class="right" type="text" data-field="prof" placeholder="Prof. Rossi" value="${esc(s.prof)}" autocomplete="off"></div>
      <div class="grow"><label for="f-cfu">CFU</label><input id="f-cfu" class="right" type="text" inputmode="numeric" pattern="[0-9]*" data-field="cfu" placeholder="9" value="${esc(s.cfu)}" autocomplete="off"></div>
    </div>
    <div class="fgroup"><span class="field-label">Giorni di lezione</span>${dayPicker(s.days)}</div>
    <div class="fgroup"><span class="field-label">Colore</span>
      <div class="swatches" role="radiogroup" aria-label="Colore">${TINTS.map((t) => `<button class="swatch ${s.tint === t ? 'on' : ''}" style="background:${t};color:${onTint(t)}" role="radio" aria-checked="${s.tint === t}" aria-label="Colore ${t}" data-act="sfield" data-field="tint" data-value="${t}">${s.tint === t ? I.check(16, 3) : ''}</button>`).join('')}
        <label class="swatch custom ${TINTS.includes(s.tint) ? '' : 'on'}" style="${TINTS.includes(s.tint) ? '' : `background:${esc(s.tint)};color:${onTint(s.tint)}`}" aria-label="Altro colore">${TINTS.includes(s.tint) ? I.plus(18, 2.6) : I.check(16, 3)}<input type="color" data-field="tint" value="${esc(s.tint)}"></label>
      </div>
    </div>
    ${s.mode === 'edit' ? '<button class="danger-btn" data-act="delete-course">Elimina corso</button>' : ''}`;
}
function sheetSemester(s) {
  const ok = s.title.trim() && s.year.trim();
  const presets = ['1° Semestre', '2° Semestre', 'Annuale'];
  return `${sheetHead(s.mode === 'new' ? 'Nuovo semestre' : 'Semestre attuale', 'save-sem', !ok)}
    <div class="chips">${presets.map((p) => `<button class="chip plain ${s.title === p ? 'on' : ''}" data-act="sfield" data-field="title" data-value="${p}">${p}</button>`).join('')}</div>
    <div class="group">
      <div class="grow"><label for="f-st">Nome</label><input id="f-st" class="right" type="text" data-field="title" value="${esc(s.title)}" placeholder="1° Semestre" autocomplete="off"></div>
      <div class="grow"><label for="f-sy">Anno accademico</label><input id="f-sy" class="right" type="text" data-field="year" value="${esc(s.year)}" placeholder="2026/2027" inputmode="numeric" autocomplete="off"></div>
      <div class="grow"><label for="f-ss">Inizio lezioni</label><input id="f-ss" class="date-in" type="date" data-field="start" value="${esc(s.start)}"></div>
    </div>
    <p class="sheet-note">L'inizio lezioni serve a contare le settimane e a proporti le lezioni già trascorse quando aggiungi un corso.</p>
    ${s.mode === 'new' && !S.semesters.length ? '<p class="sheet-note">Dopo potrai aggiungere i corsi. Quando il semestre finisce, concludilo dalla Home: i corsi passano in Archivio.</p>' : ''}`;
}
function sheetConclude() {
  const sem = curSem();
  const courses = curCourses();
  const ss = semStats(courses);
  return `<div class="sheet-head"><button class="gbtn circle close" data-act="close-sheet" aria-label="Chiudi">${I.close()}</button><h2>Riepilogo</h2><span class="spacer"></span></div>
    <div class="conc-head"><h2 id="sheet-title">Concludi il ${esc(sem.title)}</h2><p>${courses.length === 1 ? 'Il corso passa' : `I ${courses.length} corsi passano`} in Archivio e la Home si svuota per il nuovo semestre.</p></div>
    <div class="card conc-stats">${ringsFor(ss, RING_SIZE, "conc")}<div class="conc-grid">
      <div><span>Lezioni</span><b>${ss.total}</b></div>
      <div><span style="color:var(--blueText)">In pari</span><b>${pct(ss.onTrack, ss.total)}<small>%</small></b></div>
      <div><span style="color:var(--orangeText)">Da recuperare</span><b>${ss.m}</b></div>
      <div><span style="color:var(--mintText)">Appunti</span><b>${pct(ss.notes, ss.total)}<small>%</small></b></div>
    </div></div>
    <ul class="card clist">${courses.map((c) => { const m = stats(c).m; return `<li>${codeIcon(c, 30, 8, 11)}<span class="n">${esc(c.name)}</span><span class="s" style="color:${m ? 'var(--orangeText)' : 'var(--blueText)'}">${m ? m + ' da recuperare' : 'In pari'}</span></li>`; }).join('')}</ul>
    <p class="sheet-note">Le lezioni da recuperare restano visibili nell'Archivio. Puoi ripristinare un corso nel semestre attuale quando vuoi.</p>
    <div style="margin-top:auto"><button class="primary" data-act="do-conclude">Archivia e inizia il nuovo</button></div>`;
}
const examOk = (s) => s.name.trim() && (s.status !== 'passed' || s.kind === 'idoneita' || !!s.grade);
// Corsi da collegare: prima quelli del semestre attuale, poi gli archiviati dal più recente.
function linkableCourses() {
  const cur = curSem();
  const rank = (c) => { const sem = semById(c.semId); return sem === cur ? Infinity : (sem && sem.archivedAt) || 0; };
  return S.courses.slice().sort((a, b) => rank(b) - rank(a));
}
function sheetExam(s) {
  const courses = linkableCourses();
  const passed = s.status === 'passed';
  return `${sheetHead(s.mode === 'new' ? 'Nuovo esame' : 'Modifica esame', 'save-exam', !examOk(s))}
    ${courses.length ? `<div class="fgroup"><span class="field-label">Corso collegato (facoltativo)</span><div class="chips" role="radiogroup" aria-label="Corso collegato">
      <button class="chip plain ${!s.courseId ? 'on' : ''}" role="radio" aria-checked="${!s.courseId}" data-act="exam-course" data-value="">Nessuno</button>
      ${courses.map((c) => `<button class="chip ${c.id === s.courseId ? 'on' : ''}" role="radio" aria-checked="${c.id === s.courseId}" data-act="exam-course" data-value="${c.id}">${codeIcon(c, 28, 14, 11)}${esc(c.name)}</button>`).join('')}
    </div></div>` : ''}
    <div class="group">
      <div class="grow"><input type="text" data-field="name" placeholder="Nome dell'esame" aria-label="Nome dell'esame" value="${esc(s.name)}" autocomplete="off" enterkeyhint="next"></div>
      <div class="grow"><label for="f-ecfu">CFU</label><input id="f-ecfu" class="right" type="text" inputmode="numeric" pattern="[0-9]*" data-field="cfu" placeholder="6" value="${esc(s.cfu)}" autocomplete="off"></div>
    </div>
    <div class="fgroup"><span class="field-label">Stato</span>${sseg('status', [['passed', 'Superato', 'blue', I.check(14)], ['todo', 'Da sostenere', 'plain']], s.status)}</div>
    <div class="fgroup"><span class="field-label">Valutazione</span>${sseg('kind', [['voto', 'Con voto', 'plain'], ['idoneita', 'Idoneità', 'plain']], s.kind)}</div>
    ${passed && s.kind !== 'idoneita' ? `<div class="fgroup"><span class="field-label">Voto</span><div class="grades" role="radiogroup" aria-label="Voto">
      ${GRADES.map((g) => `<button class="day ${+s.grade === g ? 'on' : ''}" role="radio" aria-checked="${+s.grade === g}" aria-label="${g === 31 ? '30 e lode' : g}" data-act="sfield" data-field="grade" data-value="${g}">${gradeLabel(g)}</button>`).join('')}
    </div></div>` : ''}
    ${passed ? `<div class="group"><div class="grow"><span>Data</span><input class="date-in" type="date" data-field="date" value="${esc(s.date)}" max="${todayISO()}" aria-label="Data dell'esame"></div></div>` : ''}
    ${!passed && s.kind !== 'idoneita' ? '<p class="sheet-note">Negli esami da sostenere puoi scegliere un voto ipotetico dal Libretto, per simulare come cambierebbe la media.</p>' : ''}
    ${s.mode === 'edit' ? '<button class="danger-btn" data-act="delete-exam">Elimina esame</button>' : ''}`;
}
function sheetTarget(s) {
  return `${sheetHead('Obiettivo', 'save-target', false)}
    <div class="group">
      <div class="grow"><label for="f-tg">Media obiettivo</label><input id="f-tg" class="right" type="text" inputmode="decimal" data-field="target" placeholder="27,5" value="${esc(s.target)}" autocomplete="off"></div>
    </div>
    <p class="sheet-note">Procedo calcola il voto medio che ti serve nei ${S.degreeCfu} CFU del corso di laurea che non hai ancora acquisito. Se alcuni esami da sostenere sono a idoneità, inseriscili nel Libretto come “Idoneità”: così non pesano nel calcolo.</p>
    ${S.target ? '<button class="danger-btn" data-act="clear-target">Rimuovi obiettivo</button>' : ''}`;
}
function sheetDegree(s) {
  const ok = parseInt(s.degreeCfu, 10) > 0;
  return `${sheetHead('Corso di laurea', 'save-degree', !ok)}
    <div class="group">
      <div class="grow"><label for="f-dc">CFU totali</label><input id="f-dc" class="right" type="text" inputmode="numeric" pattern="[0-9]*" data-field="degreeCfu" placeholder="180" value="${esc(s.degreeCfu)}" autocomplete="off"></div>
    </div>
    <div class="chips">${DEGREES.map(([v, t, y]) => `<button class="chip plain ${s.degreeCfu === String(v) ? 'on' : ''}" data-act="sfield" data-field="degreeCfu" data-value="${v}">${v} · ${cap(t.replace('Laurea ', '').replace('Magistrale a ciclo unico', 'Ciclo unico ' + y))}</button>`).join('')}</div>
    <p class="sheet-note">Di solito 180 CFU per la triennale e 120 per la magistrale. L'anello del Libretto si chiude quando li hai acquisiti tutti.</p>`;
}
function sheetCheckin(s) {
  const byDate = {};
  s.items.forEach((it, i) => { (byDate[it.date] = byDate[it.date] || []).push(i); });
  const miss = s.items.filter((it) => it.p === 'M').length;
  return `${sheetHead('Conferma presenze', 'save-checkin', false, 'Conferma')}
    <p class="sheet-note">Tocca le lezioni che non hai seguito: passano tra quelle da recuperare.</p>
    <div class="chips"><button class="chip plain" data-act="ck-every" data-value="S">Tutte presenti</button><button class="chip plain" data-act="ck-every" data-value="M">Tutte da recuperare</button></div>
    ${Object.keys(byDate).sort().map((d) => `<div class="fgroup"><span class="field-label">${esc(dayName(d))}</span><div class="group">${byDate[d].map((i) => {
      const it = s.items[i], c = courseById(it.cid);
      return `<div class="grow ck-row">${codeIcon(c, 30, 8, 11)}<span class="n">${esc(c.name)}</span>${sseg('ck', [['S', 'Presente', 'blue', I.check(14)], ['M', 'Da recuperare', 'orange', I.warn(13)]], it.p).replace(/data-act="sfield" data-field="ck"/g, `data-act="ck-set" data-i="${i}"`)}</div>`;
    }).join('')}</div></div>`).join('')}
    <p class="past-sum">${miss ? `<b>${miss} da recuperare</b> · ${s.items.length - miss} ${plural(s.items.length - miss, 'presente', 'presenti')}` : `<b>Tutte presenti</b>`}</p>`;
}
function sheetRings() {
  const ss = semStats(curCourses());
  const row = (color, icon, title, txt) => `<li class="rh-row"><span class="rh-ico" style="background:${color}">${icon}</span><span class="t"><b>${title}</b><span>${txt}</span></span></li>`;
  return `${sheetHead('Gli anelli')}
    <div class="rh-ring">${ringsFor(ss, 104, 'help')}</div>
    <ul class="card rh-list">
      ${row('var(--blue)', I.check(16, 3), 'Anello esterno, blu: lezioni in pari', `Quelle seguite o recuperate: ${ss.onTrack} su ${ss.total}.`)}
      ${row('var(--orange)', I.warn(15), 'Tratto arancione: da recuperare', `Lezioni perse e non ancora recuperate: ${ss.m}. Più è lungo, più sei indietro.`)}
      ${row('var(--mint)', I.doc(15), 'Anello interno, menta: appunti sistemati', `Lezioni con gli appunti a posto: ${ss.notes} su ${ss.total}.`)}
    </ul>
    <p class="sheet-note">Gli anelli si chiudono quando sei in pari con tutte le lezioni e con tutti gli appunti del semestre.</p>`;
}
function sheetConfirm(s) {
  return `<div class="sheet-head"><button class="gbtn circle close" data-act="close-sheet" aria-label="Chiudi">${I.close()}</button><span class="spacer"></span></div>
    <div class="conc-head"><h2 id="sheet-title">${esc(s.title)}</h2>${s.msg ? `<p>${esc(s.msg)}</p>` : ''}</div>
    <div class="conf-btns"><button class="primary ${s.danger ? 'danger' : ''}" data-act="confirm-ok">${esc(s.ok)}</button>
    <button class="plain-btn" data-act="close-sheet">Annulla</button></div>`;
}
function renderSheet() {
  const root = $('#sheet-root');
  const s = ui.sheet;
  // Con un foglio aperto la pagina sotto è inerte: VoiceOver e la tastiera restano nel foglio.
  app.inert = !!s;
  syncBack();
  if (!s) {
    root.innerHTML = '';
    const el = sheetOpener && app.querySelector(sheetOpener);
    sheetOpener = null;
    if (el) el.focus({ preventScroll: true });
    return;
  }
  const prev = root.querySelector('.sheet');
  const scroll = prev ? prev.scrollTop : 0;
  const focused = !ui.sheetNew && prev && prev.contains(document.activeElement) ? selectorOf(document.activeElement) : null;
  const html = { lesson: sheetLesson, course: sheetCourse, semester: sheetSemester, conclude: sheetConclude, past: sheetPast, exam: sheetExam, target: sheetTarget, degree: sheetDegree, confirm: sheetConfirm, checkin: sheetCheckin, rings: sheetRings }[s.type](s);
  const full = s.type === 'conclude' && !wideMQ.matches;
  root.innerHTML = `<div class="backdrop" data-act="close-sheet"></div><section class="sheet ${full ? 'full' : ''} ${ui.sheetNew ? 'anim' : ''}" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="grabber" aria-hidden="true"></div>${html}</section>`;
  const sheet = root.querySelector('.sheet');
  sheet.scrollTop = scroll;
  // Il foglio viene ridisegnato a ogni scelta: il focus torna sullo stesso controllo, o sul titolo se è nuovo.
  const again = focused && sheet.querySelector(focused);
  if (again) again.focus({ preventScroll: true });
  else if (ui.sheetNew) { const t = sheet.querySelector('#sheet-title'); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } }
  ui.sheetNew = false;
}
// App Android: il tasto Indietro serve alla pagina solo se c'è un foglio aperto o non sei nella Home.
let canBack = null;
function syncBack() {
  const can = !!ui.sheet || route().name !== 'home';
  if (can === canBack || !window.ProcedoAndroid || !window.ProcedoAndroid.setCanGoBack) return;
  canBack = can;
  window.ProcedoAndroid.setCanGoBack(can);
}
// Selettore per ritrovare lo stesso controllo dopo che la pagina o il foglio sono stati ridisegnati.
function selectorOf(el) {
  if (!el || el === document.body) return null;
  if (el.id) return '#' + CSS.escape(el.id);
  const d = el.dataset || {};
  const parts = ['act', 'id', 'field', 'value', 'filter', 'course', 'i'].filter((k) => d[k] != null).map((k) => `[data-${k}="${CSS.escape(d[k])}"]`);
  return parts.length ? el.tagName.toLowerCase() + parts.join('') : null;
}
let sheetOpener = null;
function openSheet(s) {
  if (!ui.sheet) sheetOpener = selectorOf(document.activeElement);
  ui.sheet = s; ui.sheetNew = true; renderSheet();
}
function closeSheet() { ui.sheet = null; renderSheet(); }

/* ---------- Toast ---------- */
// Con `undo` l'avviso ha il pulsante Annulla e resta più a lungo (e finché il focus è sul pulsante).
let toastTimer = null, undoFn = null;
function hideToast() { clearTimeout(toastTimer); $('#toast-root').innerHTML = ''; undoFn = null; }
function toast(msg, bad, undo) {
  const root = $('#toast-root');
  undoFn = undo || null;
  root.innerHTML = `<div class="toast glass ${undo ? 'has-undo' : ''}" role="status"><span class="ck" style="${bad ? 'background:var(--red)' : ''}">${bad ? I.warn(14) : I.check(14, 3)}</span><span class="tmsg">${esc(msg)}</span>${undo ? '<button class="undo" data-act="undo">Annulla</button>' : ''}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, undo ? 5000 : 2600);
}
$('#toast-root').addEventListener('focusin', () => clearTimeout(toastTimer));
$('#toast-root').addEventListener('focusout', () => { clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, 2000); });
// Applica una modifica e propone di annullarla: ripristina lo stato com'era prima.
function undoable(msg, fn) {
  const snap = JSON.stringify(S);
  commit(fn);
  toast(msg, false, () => { S = migrate(JSON.parse(snap)); save(); render(); toast('Modifica annullata'); });
}
// Conferma nello stile dell'app (al posto di confirm() del browser).
function ask(o) { openSheet(Object.assign({ type: 'confirm', ok: 'Conferma', danger: false }, o)); }

/* ---------- Render e routing ---------- */
const app = $('#app');
const wideMQ = window.matchMedia('(min-width: 768px)');
const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
function route() {
  const p = (location.hash.slice(1) || '/').split('/').filter(Boolean);
  if (p[0] === 'corso' && p[1]) return { name: 'corso', id: p[1] };
  if (p[0] === 'archivio') return p[1] ? { name: 'arch-corso', id: p[1] } : { name: 'archivio' };
  if (p[0] === 'impostazioni') return { name: 'settings' };
  if (p[0] === 'libretto') return { name: 'lib' };
  return { name: 'home' };
}
function applyTheme() {
  const dark = S.theme === 'scuro' || (S.theme === 'automatico' && darkMQ.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#000000' : '#F2F2F7');
  if (window.ProcedoAndroid) window.ProcedoAndroid.setTheme(dark);
}
function render() {
  applyTheme();
  const r = route();
  const same = renderedHash === location.hash, y = window.scrollY, keep = same ? anchor : null;
  renderedHash = location.hash; anchor = null;
  const scrolls = {};
  app.querySelectorAll('[data-scroll]').forEach((el) => { scrolls[el.dataset.scroll] = el.scrollTop; });
  if (r.name === 'corso') {
    const c = courseById(r.id);
    const sem = c && semById(c.semId);
    if (!c || !sem || sem.status !== 'current') { location.replace('#/'); return; }
  }
  if (r.name === 'arch-corso' && !courseById(r.id)) { location.replace('#/archivio'); return; }
  if (wideMQ.matches) app.innerHTML = viewWide(r);
  else if (r.name === 'corso') app.innerHTML = phoneCourse(courseById(r.id));
  else if (r.name === 'archivio') app.innerHTML = phoneArchive();
  else if (r.name === 'arch-corso') app.innerHTML = `<div class="page no-nav">${archCourseBody(courseById(r.id), true)}</div>`;
  else if (r.name === 'settings') app.innerHTML = phoneSettings();
  else if (r.name === 'lib') app.innerHTML = phoneLibretto();
  else app.innerHTML = phoneHome();
  app.querySelectorAll('[data-scroll]').forEach((el) => { if (scrolls[el.dataset.scroll]) el.scrollTop = scrolls[el.dataset.scroll]; });
  if (same && !wideMQ.matches) restorePlace(keep, y);
  renderSheet();
}
/* Dopo un tocco la pagina viene ridisegnata da capo: senza questo Safari su iPhone torna in cima e,
   se sopra compare qualcosa (es. il riquadro "da recuperare"), la riga toccata scivola via.
   Si ricorda dove stava l'elemento toccato e lo rimette nello stesso punto dello schermo. */
let anchor = null, renderedHash = null;
function keepPlace(el) {
  const a = el && el.closest('[data-id]');
  // Selettore dello stesso elemento (riga o pulsante) nella pagina ridisegnata.
  const sel = a && `${a.tagName.toLowerCase()}${a.dataset.act ? `[data-act="${a.dataset.act}"]` : ''}[data-id="${CSS.escape(a.dataset.id)}"]`;
  anchor = a ? { sel, top: a.getBoundingClientRect().top } : null;
}
function restorePlace(a, y) {
  const fix = () => {
    const el = a && app.querySelector(a.sel);
    const target = el ? el.getBoundingClientRect().top + window.scrollY - a.top : y;
    if (Math.abs(window.scrollY - target) > 1) window.scrollTo(0, target);
  };
  window.scrollTo(0, y);
  fix();
  requestAnimationFrame(fix);
}
let lastRoute = location.hash;
window.addEventListener('hashchange', () => {
  const prev = lastRoute; lastRoute = location.hash;
  const wasDetail = /^#\/corso\//.test(prev), isDetail = /^#\/corso\//.test(location.hash);
  if (!ui.keepFilter) ui.filter = 'all';
  ui.keepFilter = false;
  ui.rings = {}; // entrando in una schermata gli anelli si richiudono da zero

  render();
  if (!(wideMQ.matches && wasDetail && isDetail)) {
    window.scrollTo(0, 0);
    const d = app.querySelector('[data-scroll="detail"]'); if (d) d.scrollTop = 0;
  } else {
    const d = app.querySelector('[data-scroll="detail"]'); if (d) d.scrollTop = 0;
  }
});
wideMQ.addEventListener('change', render);
darkMQ.addEventListener('change', applyTheme);

/* ---------- Azioni ---------- */
function toggleNotes(cid, lid) {
  const l = findLesson(cid, lid);
  if (!l) return;
  undoable(`Appunti lezione ${lessonNum(courseById(cid), lid)} · ${l.a ? 'da sistemare' : 'sistemati'}`, () => { l.a = !l.a; });
}
function findLesson(cid, lid) { const c = courseById(cid); return c ? c.lessons.find((l) => l.id === lid) : null; }
function goCourse(id, filter) {
  ui.filter = filter || 'all';
  ui.keepFilter = true;
  if (location.hash === '#/corso/' + id) { ui.keepFilter = false; render(); } else location.hash = '#/corso/' + id;
}
function newLesson(courseId) {
  const courses = curCourses();
  if (!courses.length) return;
  const r = route();
  const today = new Date().getDay();
  const scheduled = courses.find((c) => (c.days || []).includes(today));
  const cid = courseId || (r.name === 'corso' ? r.id : null) || (scheduled && scheduled.id) || (wideMQ.matches ? ui.sel : null) || courses[0].id;
  openSheet({ type: 'lesson', mode: 'new', courseId: cid, date: todayISO(), topic: '', p: 'S', a: false });
}
function editLesson(cid, lid) {
  const l = findLesson(cid, lid);
  if (!l) return;
  openSheet({ type: 'lesson', mode: 'edit', courseId: cid, lessonId: lid, date: l.date, topic: l.topic || '', p: l.p, a: !!l.a });
}
function nextTint() {
  const used = curCourses().map((c) => c.tint);
  return TINTS.find((t) => !used.includes(t)) || TINTS[curCourses().length % TINTS.length];
}
function openPast(courseId) {
  const c = courseById(courseId);
  if (!c) return;
  const start = semStart(semById(c.semId));
  const weeks = start <= todayISO() ? clampWeeks(weeksSince(start)) : 1;
  openSheet({ type: 'past', courseId, days: (c.days || []).slice(), weeks, p: 'S', a: false });
}
function savePast() {
  const s = ui.sheet;
  const c = courseById(s.courseId);
  if (!c) return;
  const have = new Set(c.lessons.map((l) => l.date));
  const add = pastDates(s.days, s.weeks).filter((d) => !have.has(d));
  if (!add.length) return;
  const t = Date.now();
  commit(() => {
    c.days = s.days.slice();
    add.forEach((date, i) => c.lessons.push({ id: uid(), date, topic: '', p: s.p, a: s.a, t: t + i }));
    ui.sheet = null;
  });
  if (route().name !== 'corso' || route().id !== c.id) { ui.sel = c.id; location.hash = '#/corso/' + c.id; }
  toast(`${add.length} ${plural(add.length, 'lezione aggiunta', 'lezioni aggiunte')} · ${c.code || c.name}`);
}
function saveLesson() {
  const s = ui.sheet;
  const c = courseById(s.courseId);
  if (!c) return;
  const topic = s.topic.trim();
  commit(() => {
    if (s.mode === 'new') {
      c.lessons.push({ id: uid(), date: s.date || todayISO(), topic, p: s.p, a: s.a, t: Date.now() });
    } else {
      const l = c.lessons.find((x) => x.id === s.lessonId);
      if (l) { Object.assign(l, { date: s.date || l.date, topic, p: s.p, a: s.a }); delete l.chk; }
    }
    ui.sheet = null;
  });
  if (s.mode === 'new') toast(`Lezione registrata · ${c.code || c.name}`);
}
function saveCourse() {
  const s = ui.sheet;
  const name = s.name.trim();
  if (!name) return;
  const data = { name, code: (s.code.trim() || autoCode(name) || name.slice(0, 2)).toUpperCase().slice(0, 3), tint: s.tint, prof: s.prof.trim(), cfu: parseInt(s.cfu, 10) || '', days: s.days.slice() };
  let id = s.id;
  commit(() => {
    if (s.mode === 'new') { id = uid(); S.courses.push(Object.assign({ id, semId: curSem().id, lessons: [], createdAt: Date.now(), autoUntil: yesterdayISO() }, data)); }
    else Object.assign(courseById(id), data);
    ui.sheet = null;
  });
  if (s.mode !== 'new') return;
  ui.sel = id;
  if (wideMQ.matches) location.hash = '#/corso/' + id;
  // Semestre già iniziato e giorni indicati: propone subito di segnare le lezioni passate.
  const start = semStart(curSem());
  if (data.days.length && start <= todayISO() && pastDates(data.days, clampWeeks(weeksSince(start))).length) openPast(id);
  else toast('Corso aggiunto');
}
function saveSemester() {
  const s = ui.sheet;
  commit(() => {
    const data = { title: s.title.trim(), year: s.year.trim(), start: s.start || guessStart(s.title, s.year) };
    if (s.mode === 'new') S.semesters.push(Object.assign({ id: uid(), status: 'current', createdAt: Date.now() }, data));
    else Object.assign(curSem(), data);
    ui.sheet = null;
  });
}
function nextSemesterOf(sem) {
  const m = /^(\d{4})\s*\/\s*(\d{4})$/.exec(sem.year || '');
  if (/^1/.test(sem.title)) return { title: '2° Semestre', year: sem.year };
  if (/^2/.test(sem.title) && m) return { title: '1° Semestre', year: `${+m[1] + 1}/${+m[2] + 1}` };
  if (m) return { title: sem.title, year: `${+m[1] + 1}/${+m[2] + 1}` };
  return { title: sem.title, year: sem.year };
}
function doConclude() {
  const sem = curSem();
  if (!sem) return;
  const next = nextSemesterOf(sem);
  const snap = JSON.stringify(S);
  commit(() => {
    sem.status = 'archived'; sem.archivedAt = Date.now();
    S.semesters.push({ id: uid(), title: next.title, year: next.year, status: 'current', createdAt: Date.now() });
    ui.sheet = null; ui.sel = null; ui.open[sem.id] = true;
  });
  if (location.hash !== '#/' && location.hash !== '') location.hash = '#/';
  toast(`${sem.title} archiviato`, false, () => { S = migrate(JSON.parse(snap)); save(); render(); toast('Semestre ripristinato'); });
}
function restoreCourse(id) {
  const sem = curSem();
  const c = courseById(id);
  if (!sem || !c) { toast('Crea prima un semestre attuale dalle Impostazioni', true); return; }
  undoable(`“${c.name}” ripristinato nel ${sem.title}`, () => { c.semId = sem.id; c.autoUntil = todayISO(); });
  location.hash = '#/corso/' + id;
}
function deleteCourse(id) {
  const c = courseById(id);
  if (!c) return;
  const n = c.lessons.length;
  ask({
    title: `Eliminare “${c.name}”?`, msg: `Spariscono anche le sue ${n} ${plural(n, 'lezione', 'lezioni')}. Avrai pochi secondi per annullare.`, ok: 'Elimina corso', danger: true,
    onOk: () => {
      const wasArch = route().name === 'arch-corso';
      undoable(`“${c.name}” eliminato`, () => { S.courses = S.courses.filter((x) => x.id !== id); });
      location.hash = wasArch ? '#/archivio' : '#/';
    }
  });
}
function newExam(courseId) {
  const c = courseId ? courseById(courseId) : null;
  openSheet({ type: 'exam', mode: 'new', courseId: c ? c.id : '', name: c ? c.name : '', cfu: c && c.cfu ? String(c.cfu) : '', status: 'passed', kind: 'voto', grade: '', date: todayISO() });
}
function editExam(id) {
  const e = examById(id);
  if (!e) return;
  openSheet({ type: 'exam', mode: 'edit', id, courseId: e.courseId && courseById(e.courseId) ? e.courseId : '', name: e.name, cfu: e.cfu ? String(e.cfu) : '', status: e.status, kind: e.kind || 'voto', grade: e.grade ? String(e.grade) : '', date: e.date || todayISO() });
}
function saveExam() {
  const s = ui.sheet;
  if (!examOk(s)) return;
  const c = s.courseId ? courseById(s.courseId) : null;
  const name = s.name.trim();
  const passed = s.status === 'passed';
  const data = {
    name, cfu: parseInt(s.cfu, 10) || 0, status: passed ? 'passed' : 'todo', kind: s.kind === 'idoneita' ? 'idoneita' : 'voto',
    grade: passed && s.kind !== 'idoneita' ? +s.grade : null, date: passed ? (s.date || todayISO()) : '',
    courseId: c ? c.id : null, code: c ? c.code : autoCode(name).slice(0, 3) || name.slice(0, 2).toUpperCase()
  };
  commit(() => {
    if (s.mode === 'new') {
      S.exams.push(Object.assign({ id: uid(), tint: c ? c.tint : TINTS[S.exams.length % TINTS.length], sim: null, createdAt: Date.now() }, data));
    } else {
      const e = examById(s.id);
      if (e) { Object.assign(e, data); if (c) e.tint = c.tint; if (passed) e.sim = null; }
    }
    ui.sheet = null;
  });
  if (s.mode === 'new') toast(passed ? `Esame registrato · ${data.kind === 'idoneita' ? 'Idoneo' : gradeLabel(data.grade)}` : 'Esame aggiunto');
}
function pickExamCourse(id) {
  const s = ui.sheet;
  const prev = s.courseId ? courseById(s.courseId) : null;
  const c = id ? courseById(id) : null;
  s.courseId = c ? c.id : '';
  // Riempie nome e CFU dal corso, senza cancellare quello che hai scritto a mano.
  if (c && (!s.name.trim() || (prev && s.name === prev.name))) s.name = c.name;
  if (c && c.cfu && (!s.cfu || (prev && s.cfu === String(prev.cfu)))) s.cfu = String(c.cfu);
  renderSheet();
}
function saveTarget() {
  const s = ui.sheet;
  const t = parseFloat(String(s.target).replace(',', '.'));
  if (s.target.trim() && !(t >= 18 && t <= 30)) { toast('La media obiettivo va da 18 a 30', true); return; }
  commit(() => { S.target = t ? Math.round(t * 100) / 100 : ''; ui.sheet = null; });
}
function setDegree(v) {
  const deg = parseInt(v, 10);
  if (!(deg > 0)) return;
  const first = !S.degreeSet;
  commit(() => { S.degreeCfu = deg; S.degreeSet = true; ui.sheet = null; });
  if (first) toast(`Corso di laurea da ${deg} CFU`);
}
async function exportData() {
  const name = `procedo-backup-${todayISO()}.json`;
  const json = JSON.stringify({ app: 'procedo', version: 1, exportedAt: new Date().toISOString(), state: S }, null, 2);
  // App Android: salva il file con il selettore di sistema (la WebView non supporta share/download).
  if (window.ProcedoAndroid) { window.ProcedoAndroid.saveFile(name, json); return; }
  const file = new File([json], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Backup Procedo' }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function importData(file) {
  const rd = new FileReader();
  rd.onload = () => {
    let obj;
    try { obj = JSON.parse(rd.result); } catch (e) { toast('File non valido', true); return; }
    const st = obj && obj.state ? obj.state : obj;
    if (!st || !Array.isArray(st.semesters) || !Array.isArray(st.courses)) { toast('Non è un backup di Procedo', true); return; }
    const n = st.courses.length;
    ask({
      title: 'Importare il backup?', msg: `Contiene ${n} ${plural(n, 'corso', 'corsi')}. I dati attuali su questo dispositivo verranno sostituiti.`, ok: 'Importa e sostituisci', danger: true,
      onOk: () => { undoable('Backup importato', () => { S = migrate(st); ui.sel = null; }); location.hash = '#/'; }
    });
  };
  rd.readAsText(file);
}

const ACT = {
  'new-sem': () => { const t = defaultSemTitle(), y = defaultYear(); openSheet({ type: 'semester', mode: 'new', title: t, year: y, start: guessStart(t, y) }); },
  'edit-sem': () => { const s = curSem(); openSheet({ type: 'semester', mode: 'edit', title: s.title, year: s.year, start: semStart(s), startTouched: !!s.start }); },
  'new-course': () => openSheet({ type: 'course', mode: 'new', name: '', code: '', prof: '', cfu: '', days: [], tint: nextTint() }),
  'edit-course': (d) => { const c = courseById(d.id); if (c) openSheet({ type: 'course', mode: 'edit', id: c.id, name: c.name, code: c.code || '', prof: c.prof || '', cfu: c.cfu ? String(c.cfu) : '', days: (c.days || []).slice(), tint: c.tint }); },
  'new-lesson': (d) => newLesson(d.id),
  'edit-lesson': (d) => editLesson(d.course, d.id),
  'conclude': () => { if (curCourses().length) openSheet({ type: 'conclude' }); },
  'do-conclude': doConclude,
  'close-sheet': closeSheet,
  'save-lesson': saveLesson,
  'save-course': saveCourse,
  'save-sem': saveSemester,
  'past': (d) => openPast(d.id || (ui.sheet && ui.sheet.courseId)),
  'save-past': savePast,
  'toggle-day': (d) => { const s = ui.sheet, v = +d.value; s.days = s.days.includes(v) ? s.days.filter((x) => x !== v) : s.days.concat(v); renderSheet(); },
  'weeks': (d) => { ui.sheet.weeks = clampWeeks(ui.sheet.weeks + (+d.value)); renderSheet(); },
  'weeks-set': (d) => { ui.sheet.weeks = clampWeeks(+d.value); renderSheet(); },
  'delete-lesson': () => {
    const s = ui.sheet;
    const c = courseById(s.courseId);
    const n = lessonNum(c, s.lessonId);
    undoable(`Lezione ${n} eliminata`, () => { c.lessons = c.lessons.filter((l) => l.id !== s.lessonId); ui.sheet = null; });
  },
  'delete-course': (d) => deleteCourse(d.id || (ui.sheet && ui.sheet.id)),
  'new-exam': (d) => newExam(d.course),
  'edit-exam': (d) => editExam(d.id),
  'exam-course': (d) => pickExamCourse(d.value),
  'save-exam': saveExam,
  'delete-exam': () => {
    const s = ui.sheet;
    undoable('Esame eliminato dal Libretto', () => { S.exams = S.exams.filter((e) => e.id !== s.id); ui.sheet = null; });
  },
  'clear-sim': () => undoable('Voti simulati azzerati', () => { S.exams.forEach((e) => { e.sim = null; }); }),
  'edit-target': () => openSheet({ type: 'target', target: S.target ? fmtNum(S.target) : '', degreeCfu: S.degreeCfu ? String(S.degreeCfu) : '' }),
  'save-target': saveTarget,
  'set-degree': (d) => setDegree(d.value),
  'edit-degree': () => openSheet({ type: 'degree', degreeCfu: S.degreeSet && S.degreeCfu ? String(S.degreeCfu) : '' }),
  'save-degree': () => setDegree(ui.sheet.degreeCfu),
  'clear-target': () => commit(() => { S.target = ''; ui.sheet = null; }),
  'sfield': (d) => {
    const s = ui.sheet;
    if (d.field === 'a') s.a = d.value === '1'; else s[d.field] = d.value;
    if (s.type === 'semester' && d.field === 'title' && !s.startTouched) s.start = guessStart(s.title, s.year);
    renderSheet();
  },
  'cycle': (d) => {
    const l = findLesson(d.course, d.id);
    if (!l) return;
    const p = { S: 'M', M: 'R', R: 'S' }[l.p];
    undoable(`Lezione ${lessonNum(courseById(d.course), l.id)} · ${P_LABEL[p]}`, () => { l.p = p; delete l.chk; });
  },
  'toggle-a': (d) => toggleNotes(d.course, d.id),
  'rings-help': () => openSheet({ type: 'rings' }),
  'checkin-all': () => {
    const P = pendingLessons();
    undoable(`${P.length} ${plural(P.length, 'lezione confermata', 'lezioni confermate')} · presente`, () => { P.forEach(({ l }) => { l.p = 'S'; delete l.chk; }); });
  },
  'checkin-open': () => {
    const P = pendingLessons();
    if (P.length === 1) {
      const { l } = P[0];
      undoable('Lezione segnata da recuperare', () => { l.p = 'M'; delete l.chk; });
      return;
    }
    openSheet({ type: 'checkin', items: P.map(({ c, l }) => ({ cid: c.id, lid: l.id, date: l.date, p: l.p === 'M' ? 'M' : 'S' })) });
  },
  'ck-set': (d) => { ui.sheet.items[+d.i].p = d.value; renderSheet(); },
  'ck-every': (d) => { ui.sheet.items.forEach((it) => { it.p = d.value; }); renderSheet(); },
  'save-checkin': () => {
    const s = ui.sheet;
    const miss = s.items.filter((it) => it.p === 'M').length;
    undoable(`Presenze confermate${miss ? ` · ${miss} da recuperare` : ''}`, () => {
      s.items.forEach((it) => { const l = findLesson(it.cid, it.lid); if (l) { l.p = it.p; delete l.chk; } });
      ui.sheet = null;
    });
  },
  'undo': () => { const fn = undoFn; hideToast(); if (fn) fn(); },
  'confirm-ok': () => { const s = ui.sheet; closeSheet(); if (s && s.onOk) s.onOk(); },
  'filter': (d) => { ui.filter = d.filter; render(); },
  'goto-filter': (d) => goCourse(d.id, d.filter),
  'goto-notes': (d) => goCourse(d.id, 'notes'),
  'toggle-group': (d) => { ui.open[d.id] = ui.open[d.id] === false; render(); },
  'restore': (d) => restoreCourse(d.id),
  'theme': (d) => commit(() => { S.theme = d.id; }),
  'toggle-remind': () => commit(() => { S.remind = !S.remind; }),
  'toggle-auto': () => { commit(() => { S.auto = S.auto === false; curCourses().forEach((c) => { c.autoUntil = todayISO(); }); }); },
  'toggle-side': () => { ui.side = !sideOpen(); render(); },
  'export': exportData,
  'import': () => { const inp = $('#import-file'); inp.value = ''; inp.click(); },
  'wipe': () => ask({
    title: 'Cancellare tutti i dati?', msg: 'Semestri, corsi, lezioni e Libretto verranno tolti da questo dispositivo.', ok: 'Continua', danger: true,
    onOk: () => ask({
      title: 'Sei sicuro?', msg: 'Se non hai un backup, i dati andranno persi. Avrai pochi secondi per annullare.', ok: 'Cancella tutti i dati', danger: true,
      onOk: () => { undoable('Dati cancellati', () => { S = defaultState(); ui.sel = null; }); location.hash = '#/'; }
    })
  })
};

let suppressClick = 0;
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (Date.now() - suppressClick < 400) { e.preventDefault(); return; }
  if (el.disabled) return;
  const fn = ACT[el.dataset.act];
  // I tocchi nei fogli lasciano come riferimento la riga che li ha aperti.
  if (fn && !el.closest('#sheet-root')) keepPlace(el);
  if (fn) { e.preventDefault(); fn(el.dataset); }
});
document.addEventListener('input', (e) => {
  const f = e.target.dataset && e.target.dataset.field;
  if (!f || !ui.sheet || e.target.tagName === 'SELECT') return;
  const s = ui.sheet;
  if (e.target.type === 'date') return;
  s[f] = e.target.value;
  if (s.type === 'course' && (f === 'name' || f === 'code')) {
    const prev = $('#course-prev');
    if (prev) prev.innerHTML = codeIcon({ tint: s.tint, code: (s.code || autoCode(s.name) || '?').toUpperCase() }, 64, 18, 22);
    const codeIn = $('#f-code'); if (codeIn && f === 'name') codeIn.placeholder = autoCode(s.name) || 'AM';
    const ok = $('.sheet-head .ok'); if (ok) ok.disabled = !s.name.trim();
  }
  if (s.type === 'semester') { const ok = $('.sheet-head .ok'); if (ok) ok.disabled = !(s.title.trim() && s.year.trim()); }
  if (s.type === 'exam') { const ok = $('.sheet-head .ok'); if (ok) ok.disabled = !examOk(s); }
  if (s.type === 'degree') { const ok = $('.sheet-head .ok'); if (ok) ok.disabled = !(parseInt(s.degreeCfu, 10) > 0); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'import-file') { if (t.files && t.files[0]) importData(t.files[0]); return; }
  const f = t.dataset && t.dataset.field;
  if (f === 'autoP') { commit(() => { S.autoP = t.value; }); return; }
  if (f === 'remindDays') { commit(() => { S.remindDays = parseInt(t.value, 10) || 3; }); return; }
  if (f === 'sim') { keepPlace(t); commit(() => { const e = examById(t.dataset.id); if (e) e.sim = parseInt(t.value, 10) || null; }); return; }
  if (f === 'date' && ui.sheet) { if (t.value) ui.sheet.date = t.value; renderSheet(); }
  if (f === 'start' && ui.sheet) { if (t.value) { ui.sheet.start = t.value; ui.sheet.startTouched = true; } renderSheet(); }
  if (f === 'tint' && ui.sheet) { ui.sheet.tint = t.value.toUpperCase(); renderSheet(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && ui.sheet) closeSheet();
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && ui.sheet) e.target.blur();
});

/* ---------- Scorrimento sulle righe lezione ---------- */
let sw = null;
document.addEventListener('touchstart', (e) => {
  const fg = e.target.closest('.lrow-fg');
  if (!fg || e.touches.length > 1) { sw = null; return; }
  const t = e.touches[0];
  // "Recuperata" (scorrimento a destra) ha senso solo per le lezioni da recuperare.
  sw = { fg, row: fg.parentElement, x: t.clientX, y: t.clientY, dx: 0, active: false, dead: false, armed: false, canRecup: fg.parentElement.classList.contains('miss') };
}, { passive: true });
document.addEventListener('touchmove', (e) => {
  if (!sw || sw.dead) return;
  const t = e.touches[0];
  const dx = t.clientX - sw.x, dy = t.clientY - sw.y;
  if (!sw.active) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { sw.dead = true; return; }
    if (Math.abs(dx) < 12) return;
    sw.active = true; sw.fg.style.transition = 'none';
  }
  e.preventDefault();
  sw.dx = dx;
  const blocked = dx > 0 && !sw.canRecup;
  // Verso destra su una lezione non da recuperare la riga resiste e torna indietro, senza azione.
  const lim = blocked ? Math.min(24, dx * 0.2) : Math.max(-170, Math.min(170, dx));
  sw.fg.style.transform = `translateX(${lim}px)`;
  sw.row.classList.toggle('sw-right', dx > 0 && !blocked);
  sw.row.classList.toggle('sw-left', dx < 0);
  const armed = !blocked && Math.abs(dx) >= SWIPE_T;
  if (armed !== sw.armed) { sw.armed = armed; sw.row.classList.toggle('sw-armed', armed); if (armed && navigator.vibrate) navigator.vibrate(8); }
}, { passive: false });
function endSwipe() {
  if (!sw) return;
  const s = sw; sw = null;
  if (!s.active) return;
  suppressClick = Date.now();
  keepPlace(s.row);
  s.fg.style.transition = 'transform .25s ease';
  s.fg.style.transform = '';
  const { id, course } = s.row.dataset;
  setTimeout(() => {
    if (s.dx >= SWIPE_T && s.canRecup) {
      const l = findLesson(course, id);
      if (l) undoable(`Lezione ${lessonNum(courseById(course), id)} · Recuperata`, () => { l.p = 'R'; delete l.chk; });
    } else if (s.dx <= -SWIPE_T) toggleNotes(course, id);
    else s.row.classList.remove('sw-right', 'sw-left', 'sw-armed');
  }, 200);
}
document.addEventListener('touchend', endSwipe);
document.addEventListener('touchcancel', endSwipe);

/* ---------- App Android (wrapper WebView) ---------- */
// Tasto Indietro: chiude il foglio aperto, poi torna alla schermata precedente; false = esci dall'app.
window.procedoBack = () => {
  if (ui.sheet) { closeSheet(); return true; }
  if (route().name !== 'home') { if (history.length > 1) history.back(); else location.hash = '#/'; return true; }
  return false;
};
window.procedoSaved = (ok) => toast(ok ? 'Backup salvato' : 'Impossibile salvare il backup', !ok);

/* ---------- Avvio ---------- */
render();
runAutoSync();
// Quando riapri l'app dal multitasking (anche giorni dopo) controlla di nuovo il calendario.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') runAutoSync(); });
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
// In sviluppo (localhost) niente cache offline, così le modifiche si vedono subito.
const isDev = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !isDev) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
})();
