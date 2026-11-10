import crypto from 'crypto';

export const COOKIE = 'us_session';
const MAX_AGE = 60 * 60 * 24 * 7; // stay unlocked for 7 days

// Changing the PIN or key in Vercel logs everyone out
function secret() {
  return (process.env.PEOPLE_API_KEY || '') + '|' + (process.env.PEOPLE_PIN || '');
}
function sign(text) {
  return crypto.createHmac('sha256', secret()).update(text).digest('hex');
}

export function makeToken() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return { value: `${exp}.${sign(exp)}`, maxAge: MAX_AGE };
}

export function validToken(value) {
  if (!value || !process.env.PEOPLE_API_KEY || !process.env.PEOPLE_PIN) return false;
  const [exp, sig] = String(value).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function pinMatches(pin) {
  const want = process.env.PEOPLE_PIN || '';
  if (!want) return false;
  const a = crypto.createHash('sha256').update(String(pin || '')).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

export const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge,
});

// Talks to the Apps Script with the secret key. Never runs in the browser.
export async function callSheet(payload) {
  const url = process.env.PEOPLE_API_URL;
  const key = process.env.PEOPLE_API_KEY;
  if (!url || !key) throw new Error('Server not configured');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, key }),
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error('Unexpected reply from Google'); }
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}