import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import Papa from 'papaparse'; // We need PapaParse on the backend now too!

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    // 1. Find out which event they are trying to book
    const body = await request.json();
    const eventId = body.eventId;

    let priceToCharge = 999; // Default fallback just in case

    // 2. Fetch the Live Price from Google Sheets
    if (eventId) {
      const res = await fetch(CSV_URL, { next: { revalidate: 0 } });
      const text = await res.text();
      
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
      });

      const currentEvent = parsed.data.find(e => e.id && e.id.trim().toLowerCase() === eventId.trim().toLowerCase());
      
      // If we found the event and it has a price in the column, use it!
      if (currentEvent && currentEvent.price) {
         // This safely turns a string like "1499" into a real number
         const parsedPrice = parseInt(currentEvent.price.replace(/[^\d]/g, ''), 10);
         if (!isNaN(parsedPrice)) {
           priceToCharge = parsedPrice;
         }
      }
    }

    // 3. Razorpay expects the amount in the smallest currency unit (paise). 
    // Example: ₹1499 = 149900 paise.
    const amount = priceToCharge * 100; 

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}