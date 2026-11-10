import { NextResponse } from 'next/server';
import { COOKIE, validToken, callSheet } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const { id, patch } = body || {};
  if (typeof id !== 'string' || !id || id.length > 80 || !patch || typeof patch !== 'object') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  if (JSON.stringify(patch).length > 60000) {
    return NextResponse.json({ error: 'Too large' }, { status: 413 });
  }

  try {
    const data = await callSheet({ action: 'update', id, patch });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not save' }, { status: 502 });
  }
}