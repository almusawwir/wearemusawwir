import { NextResponse } from 'next/server';
import { COOKIE, validToken, callSheet } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

const PERSON_ID = /^(\d{10}|no-phone-[\w-]{1,60})$/;

export async function POST(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const { kind, eventId, personId, producers, patch } = body || {};
  if (typeof eventId !== 'string' || !eventId || eventId.length > 80) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  try {
    if (kind === 'producers') {
      if (!Array.isArray(producers) || producers.length > 4 ||
          !producers.every(p => typeof p === 'string' && PERSON_ID.test(p))) {
        return NextResponse.json({ error: 'Bad producer list' }, { status: 400 });
      }
      const data = await callSheet({ action: 'producers', eventId, producers });
      return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (kind === 'mark') {
      if (typeof personId !== 'string' || !PERSON_ID.test(personId) || !patch || typeof patch !== 'object') {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
      }
      const clean = {};
      if ('paid' in patch) clean.paid = patch.paid === true;
      if ('attended' in patch) clean.attended = patch.attended === true;
      const data = await callSheet({ action: 'mark', eventId, personId, patch: clean });
      return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not save' }, { status: 502 });
  }
}