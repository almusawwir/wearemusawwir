import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();

    // The URL you copied from Google Apps Script goes inside the quotes below!
    const googleAppScriptURL = "https://script.google.com/macros/s/AKfycbwVWQ8LRutTqG6hNuMB_T1S_HTdTTDbdlO_c_auEuVX_Y_4FOrVoXBtMiu_tQHN-KSA/exec";

    await fetch(googleAppScriptURL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}