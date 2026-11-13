import { NextResponse } from 'next/server';
import { COOKIE, validToken, callSheet } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const EXCLUDED = ['rejected', 'out'];   // rejected and "not coming" are never saved

const text = (msg, status) =>
  new NextResponse(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

const esc = (s) => String(s).replace(/[\r\n\u0000-\u001f]+/g, ' ')
  .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').trim();

// First time = no sign-up for any other event before this one, and no extra events added by you
function isFirstTime(p, label, time) {
  if ((p.extra || 0) > 0) return false;
  return !(p.history || []).some(h => h.label !== label && h.time < time);
}

function card(name, phone, tag) {
  const full = String(name || 'Guest').slice(0, 80).trim() || 'Guest';
  const parts = full.split(/\s+/);
  const family = [parts.slice(1).join(' '), tag].filter(Boolean).join(' ');
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(family)};${esc(parts[0])};;;`,
    `FN:${esc([full, tag].filter(Boolean).join(' '))}`,
    `TEL;TYPE=CELL:+91${phone}`,
    'END:VCARD',
  ].join('\r\n');
}

// /api/us/vcf?event=odc-4&who=new|all&mode=inline|attachment
export async function GET(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return text('Locked. Open 3 AM Us, unlock it, and try again.', 401);
  }

  const url = new URL(request.url);
  const eventKey = (url.searchParams.get('event') || '').trim().toLowerCase();
  const who = url.searchParams.get('who') === 'new' ? 'new' : 'all';
  const inline = url.searchParams.get('mode') === 'inline';
  if (!/^[\w.\- ]{1,80}$/.test(eventKey)) return text('Unknown event.', 400);

  let data;
  try {
    data = await callSheet({ action: 'list' });
  } catch (err) {
    return text(`Couldn't load contacts: ${err.message || 'error'}`, 502);
  }

  const ev = (data.events || []).find(e => e.key === eventKey);
  if (!ev) return text('That event is no longer on the board.', 404);

  const byId = {};
  (data.people || []).forEach(p => { byId[p.id] = p; });
  const label = ev.title + (ev.tag ? ' · ' + ev.tag : '');
  const producers = new Set(ev.producers || []);
  const tag = String(ev.tag || ev.form || '').replace(/[^\w ]+/g, '').trim().slice(0, 20);

  const cards = (ev.regs || [])
    .filter(r => !EXCLUDED.includes(r.pay) && !producers.has(r.personId))   // never producers, rejected or not coming
    .map(r => ({ r, p: byId[r.personId] }))
    .filter(x => x.p && /^\d{10}$/.test(x.p.phone || ''))
    .filter(x => who === 'all' || isFirstTime(x.p, label, x.r.time))
    .map(({ p }) => card(p.name, p.phone, tag));

  if (!cards.length) {
    return text(who === 'new' ? 'No first-timers to save for this event.' : 'No phone numbers to save.', 404);
  }

  const file = `${(tag || 'contacts').replace(/\s+/g, '-')}${who === 'new' ? '-new' : ''}.vcf`;
  return new NextResponse(cards.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': inline ? 'text/x-vcard; charset=utf-8' : 'text/vcard; charset=utf-8',
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${file}"`,
      'Cache-Control': 'no-store, private',
    },
  });
}