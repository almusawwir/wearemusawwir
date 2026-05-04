import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const eventId = body.eventId;
    
    // ✦ 1. Catch the quantity from the frontend (default to 1 if missing) ✦
    const ticketCount = parseInt(body.ticketCount) || 1; 

    let singlePrice = 999;
    let groupPrice = 999;

    // ✦ 2. Fetch the live prices from your CMS sheet ✦
    if (eventId) {
      const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
      const text = await res.text();
      const parsed = Papa.parse(text, {
        header: true, 
        skipEmptyLines: true, 
        transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, '')
      });

      const currentEvent = parsed.data.find(e => e.id && e.id.trim().toLowerCase() === eventId.trim().toLowerCase());
      
      if (currentEvent) {
         if (currentEvent.price) {
             singlePrice = parseInt(currentEvent.price.replace(/[^\d]/g, ''), 10) || 999;
         }
         // If they didn't set a group price, fallback to the single price
         if (currentEvent.group_price) {
             groupPrice = parseInt(currentEvent.group_price.replace(/[^\d]/g, ''), 10) || singlePrice;
         } else {
             groupPrice = singlePrice;
         }
      }
    }

    // ✦ 3. Calculate the exact total based on Quantity and Group Pricing ✦
    const finalUnitPrice = ticketCount === 1 ? singlePrice : groupPrice;
    const totalAmountInPaise = finalUnitPrice * ticketCount * 100; 

    const options = {
      amount: totalAmountInPaise,
      currency: "INR",
      receipt: "rcpt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}