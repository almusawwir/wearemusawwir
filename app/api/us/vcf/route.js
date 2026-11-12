import { NextResponse } from 'next/server';
import { COOKIE, validToken } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

const text = (msg, status) => new NextResponse(msg, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
const esc = (s) => String(s).replace(/[\r\n\u0000-\u001f]+/g, ' ')
  .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').trim();

export async function POST(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return text('Locked. Open 3 AM Us, unlock it, and export again.', 401);
  }

  let payload;
  let mode = 'attachment';
  try {
    const form = await request.formData();
    payload = JSON.parse(String(form.get('payload') || ''));
    if (form.get('mode') === 'inline') mode = 'inline';
  } catch {
    return text('Bad request', 400);
  }

  const tag = String(payload.tag || '').replace(/[^\w ]+/g, '').trim().slice(0, 20);
  const people = Array.isArray(payload.people) ? payload.people.slice(0, 500) : [];

  const cards = people
    .filter(p => p && /^\d{10}$/.test(String(p.phone || '')))
    .map(p => {
      const full = String(p.name || 'Guest').slice(0, 80).trim() || 'Guest';
      const parts = full.split(/\s+/);
      const first = parts[0];
      const family = [parts.slice(1).join(' '), tag].filter(Boolean).join(' ');
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${esc(family)};${esc(first)};;;`,
        `FN:${esc([full, tag].filter(Boolean).join(' '))}`,
        `TEL;TYPE=CELL:+91${p.phone}`,
        'END:VCARD',
      ].join('\r\n');
    });

  if (!cards.length) return text('No phone numbers to export.', 400);

  const file = (tag || 'contacts').replace(/\s+/g, '-');
  return new NextResponse(cards.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `${mode}; filename="${file}.vcf"`,
      'Cache-Control': 'no-store',
    },
  });
}