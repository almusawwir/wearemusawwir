import { NextResponse } from 'next/server';
import { COOKIE, makeToken, pinMatches, cookieOptions } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!process.env.PEOPLE_PIN || !process.env.PEOPLE_API_KEY) {
    return NextResponse.json({ error: 'Server not configured yet' }, { status: 500 });
  }
  let pin = '';
  try { ({ pin } = await request.json()); } catch {}

  if (!pinMatches(pin)) {
    await new Promise(r => setTimeout(r, 900)); // slows down guessing
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
  }

  const { value, maxAge } = makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, value, cookieOptions(maxAge));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', cookieOptions(0));
  return res;
}