import { NextResponse } from 'next/server';
import { COOKIE, validToken, callSheet } from '../../../lib/usServer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!validToken(request.cookies.get(COOKIE)?.value)) {
    return NextResponse.json({ error: 'Locked' }, { status: 401 });
  }
  try {
    const data = await callSheet({ action: 'list' });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not load' }, { status: 502 });
  }
}