import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Your ODC Registrations script URL (ends in /exec). Same one as in the form page.
// This runs on the server only, so it's never shown to visitors.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6vQH29lAXj_FtBrCkmCpO46UJqJlhpAqpb7aRxr29pA3-W_2bW5oV-DtUYIe59xag/exec';

export async function POST(request) {
  if (!SCRIPT_URL || SCRIPT_URL.includes('PASTE_')) {
    return NextResponse.json({ ok: false, error: 'Form not configured' }, { status: 500 });
  }

  let body = '';
  try { body = await request.text(); } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
  if (!body || body.length > 4000000) {
    return NextResponse.json({ ok: false, error: 'Too large' }, { status: 413 });
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    });
    const text = (await res.text()).trim();

    // The script replies with exactly "ok" only after the row is saved
    if (res.ok && text === 'ok') return NextResponse.json({ ok: true });

    console.error('ODC script replied', res.status, text.slice(0, 300));
    const error = res.status === 404 ? 'Form link not found' : 'Could not save';
    return NextResponse.json({ ok: false, error }, { status: 502 });
  } catch (err) {
    console.error('ODC submit failed', err);
    return NextResponse.json({ ok: false, error: 'Could not reach Google' }, { status: 502 });
  }
}