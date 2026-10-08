/* ──────────────────────────────────────────────────────────────
   ONE PLACE that decides how every event card looks.
   The "status" column in your Google Sheet drives it.

   Write just the code word:            REC
   Or code word + your own label:       REC | Shooting 12 Oct
   The part after the | is what people see on the card.
   ────────────────────────────────────────────────────────────── */

export const STATUS_STYLES = {
  // Black card, blinking pink dot. The BCC look.
  REC:       { theme: 'dark',  badge: 'REC',            badgeType: 'dot',     cta: 'View event',    faded: false },

  // Pink card. Booking is live.
  OPEN:      { theme: 'pink',  badge: 'Booking open',   badgeType: 'dot',     cta: 'Book now',      faded: false },

  // Pink card, blinking badge. Running out.
  FILLING:   { theme: 'pink',  badge: 'Filling fast',   badgeType: 'dot',     cta: 'Book now',      faded: false },

  // Black card, blinking. Most urgent.
  LAST:      { theme: 'dark',  badge: 'Last spots',     badgeType: 'dot',     cta: 'Book now',      faded: false },

  // White card, thick pink edge. Just announced.
  NEW:       { theme: 'new',   badge: 'New',            badgeType: 'outline', cta: 'View event',    faded: false },

  // White card. Announced but booking not open yet.
  SOON:      { theme: 'white', badge: 'Coming soon',    badgeType: 'outline', cta: 'Get notified',  faded: false },

  // Soft pink, dashed border, rotated FREE stamp. Open to everyone.
  FREE:      { theme: 'soft',  badge: 'Free',           badgeType: 'stamp',   cta: 'Save my spot',  faded: false },

  // Black + dashed pink border. Free, but you have to be invited.
  INVITE:    { theme: 'invite', badge: 'Invite only',   badgeType: 'outline', cta: 'Request invite',faded: false },

  // Festival card: string lights along the top.
  FESTIVAL:  { theme: 'festival', badge: 'Festival',    badgeType: 'outline', cta: 'Book now',      faded: false },

  // White card. Sold out but you still want names.
  WAITLIST:  { theme: 'white', badge: 'Waitlist open',  badgeType: 'outline', cta: 'Join waitlist', faded: false },

  // Faded. No more spots.
  SOLDOUT:   { theme: 'white', badge: 'Sold out',       badgeType: 'outline', cta: 'Sold out',      faded: true  },

  // Faded. Already happened.
  PAST:      { theme: 'white', badge: 'Happened',       badgeType: 'outline', cta: 'See photos',    faded: true  },

  // Used when the status cell is empty or has something unrecognised.
  DEFAULT:   { theme: 'white', badge: '',               badgeType: 'none',    cta: 'View event',    faded: false },
};

/* Codes that should be treated as "can't book this" */
export const CLOSED_CODES = ['SOLDOUT', 'PAST'];

/* Codes that get the string-lights decoration */
export const LIT_CODES = ['FESTIVAL'];

export function parseStatus(raw) {
  const text = (raw || '').toString();
  const [codePart, ...rest] = text.split('|');
  const code = codePart.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const custom = rest.join('|').trim();

  const style = STATUS_STYLES[code] || STATUS_STYLES.DEFAULT;

  return {
    ...style,
    code: STATUS_STYLES[code] ? code : 'DEFAULT',
    badge: custom || style.badge,
    isClosed: CLOSED_CODES.includes(code),
    lit: LIT_CODES.includes(code),
  };
}