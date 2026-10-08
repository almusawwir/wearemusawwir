import { parseStatus } from './eventStyles';

export const TZ = 'Asia/Kolkata';
export const WHATSAPP_URL = "https://chat.whatsapp.com/B68V6Q62HZPHHsGMG0t4jP";
export const WHATSAPP_DM_NUMBER = '919096972905';

/* Today's date in Bangalore, with the time removed */
export function todayIST() {
  const n = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

/* Reads sheet dates safely. If the year is missing ("11 Oct"), browsers
   guess 2001, so we add the current year in that case. */
export function parseEventDate(raw) {
  if (!raw) return null;
  const s = raw.toString().trim();
  if (!s) return null;
  let d = new Date(s);
  if (isNaN(d.getTime()) || d.getFullYear() < 2020) {
    d = new Date(`${s} ${todayIST().getFullYear()}`);
  }
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDay(d, style = 'short') {
  const opts = style === 'long'
    ? { weekday: 'long', day: 'numeric', month: 'long' }
    : { weekday: 'short', day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('en-IN', opts).format(d);
}

export function formatDate(raw, style = 'short') {
  const d = parseEventDate(raw);
  if (!d) return raw && raw.toString().trim() ? raw.toString().trim() : 'TBA';
  return formatDay(d, style);
}

/* Past = status says PAST, or the date is before today. No date = not past. */
export function isPastEvent(event) {
  if (parseStatus(event.status).code === 'PAST') return true;
  const d = parseEventDate(event.date);
  return d ? d < todayIST() : false;
}

export function isFree(event) {
  const p = (event.price || '').toString().trim().toLowerCase();
  return p === '0' || p === 'free';
}

export function priceText(event, withFrom = true) {
  if (isFree(event)) return 'Free';
  const p = (event.price || '').toString().trim();
  if (!p) return 'TBA';
  return withFrom ? `From ₹${p}` : `₹${p}`;
}

const FORMAT_LABELS = { bcc: 'BCC', odc: 'ODC', community: 'Free', premium: 'Premium' };

export function getFormatLabel(event) {
  const f = (event.format || '').toLowerCase().trim();
  if (FORMAT_LABELS[f]) return FORMAT_LABELS[f];
  const text = `${event.id} ${event.title}`.toLowerCase();
  if (text.includes('bcc') || text.includes('broken camera')) return 'BCC';
  if (text.includes('odc') || text.includes('one day crew')) return 'ODC';
  if (isFree(event)) return 'Free';
  return 'Premium';
}

export function truncate(text, max = 30) {
  const t = (text || '').trim();
  if (!t) return '';
  return t.length > max ? t.slice(0, max).trimEnd() + '...' : t;
}

export function dmLink(message) {
  return WHATSAPP_DM_NUMBER
    ? `https://wa.me/${WHATSAPP_DM_NUMBER}?text=${encodeURIComponent(message)}`
    : WHATSAPP_URL;
}

/* Bookable before sold-out, then soonest first, undated last */
export function sortUpcoming(list) {
  return [...list].sort((a, b) => {
    const fa = parseStatus(a.status).faded ? 1 : 0;
    const fb = parseStatus(b.status).faded ? 1 : 0;
    if (fa !== fb) return fa - fb;
    const da = parseEventDate(a.date);
    const db = parseEventDate(b.date);
    if (da && db) return da - db;
    return da ? -1 : db ? 1 : 0;
  });
}