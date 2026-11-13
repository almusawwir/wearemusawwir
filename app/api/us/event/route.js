import { NextResponse } from 'next/server';
import { COOKIE, validToken, callSheet } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

const PERSON_ID = /^(\d{10}|no-phone-[\w-]{1,60})$/;
const PAY = ['paid', 'later', 'unpaid', 'rejected', 'out', 'free', ''];
const CATS = ['Marketing', 'Travel', 'Food', 'Venue', 'Other'];
const bad = (error = 'Bad request') => NextResponse.json({ error }, { status: 400 });

export async function POST(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch { return bad(); }
  const { kind, eventId } = body || {};
  if (typeof eventId !== 'string' || !eventId || eventId.length > 80) return bad();

  try {
    let payload;

    if (kind === 'producers') {
      const { producers } = body;
      if (!Array.isArray(producers) || producers.length > 4 ||
          !producers.every(p => typeof p === 'string' && PERSON_ID.test(p))) return bad('Bad producer list');
      payload = { action: 'producers', eventId, producers };

    } else if (kind === 'mark') {
      const { personId, patch } = body;
      if (typeof personId !== 'string' || !PERSON_ID.test(personId) || !patch || typeof patch !== 'object') return bad();
      const clean = {};
      if ('attended' in patch) clean.attended = patch.attended === true;
      if ('pay' in patch) {
        if (!PAY.includes(patch.pay)) return bad('Unknown payment status');
        clean.pay = patch.pay;
      }
      if ('amount' in patch) {
        if (patch.amount === null) clean.amount = null;
        else {
          const n = Number(patch.amount);
          if (!Number.isFinite(n) || n < 0 || n > 1000000) return bad('Bad amount');
          clean.amount = Math.round(n);
        }
      }
      if (!Object.keys(clean).length) return bad();
      payload = { action: 'mark', eventId, personId, patch: clean };

    } else if (kind === 'expense') {
      const { op } = body;
      if (op === 'add') {
        const amount = Number(body.amount);
        if (!CATS.includes(body.category) || !Number.isFinite(amount) || amount <= 0 || amount > 10000000) return bad('Bad expense');
        const note = typeof body.note === 'string' ? body.note.slice(0, 120) : '';
        payload = { action: 'expense', eventId, op, category: body.category, note, amount: Math.round(amount) };
      } else if (op === 'delete') {
        if (typeof body.id !== 'string' || !/^[\w-]{1,40}$/.test(body.id)) return bad();
        payload = { action: 'expense', eventId, op, id: body.id };
      } else {
        return bad();
      }

    } else {
      return bad('Unknown action');
    }

    const data = await callSheet(payload);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not save' }, { status: 502 });
  }
}