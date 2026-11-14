/* Crew building for 3 AM Us. Deterministic: the same people always give the same crews. */
import { splitMulti } from './helpers';

export const ROLE_OPTIONS = [
  'Director', 'Assistant Director', 'Actor', 'Writer', 'Camera (A-roll)', 'Camera (B-roll)',
  'Editor', 'Sound', 'Art Director', 'PR & BTS', 'Support',
];
// Empty slots a new manual crew starts with
export const TEMPLATE = ['Director', 'Assistant Director', 'Actor', 'Actor', 'Writer', 'Camera (A-roll)', 'Editor', 'PR & BTS'];

// Which "Wants to explore" answers count as which skill
const SKILL_TESTS = {
  director: /direct|filmmaking/i,
  actor: /\bact/i,
  camera: /cinematograph|camera|photograph/i,
  editor: /\bedit/i,
  writer: /writ/i,
  sound: /sound|music/i,
};
export const ROLE_SKILL = {
  'Director': 'director', 'Assistant Director': 'director', 'Actor': 'actor', 'Writer': 'writer',
  'Camera (A-roll)': 'camera', 'Camera (B-roll)': 'camera', 'Editor': 'editor', 'Sound': 'sound',
};
export const REQUIRED = ['director', 'actor', 'camera', 'editor', 'writer'];
export const SKILL_LABEL = { director: 'Director', actor: 'Actor', camera: 'Camera', editor: 'Editor', writer: 'Writer', sound: 'Sound' };
const ROLE_FOR = { director: 'Director', actor: 'Actor', camera: 'Camera (A-roll)', editor: 'Editor', writer: 'Writer' };
const EXP = [[/professional/i, 3], [/some experience/i, 2], [/just started/i, 1]];

export function profile(r) {
  const a = r.answers || {};
  const picks = splitMulti(a.explore);
  const exp = EXP.find(([re]) => re.test(a.experience || ''));
  return {
    id: r.personId,
    skills: Object.keys(SKILL_TESTS).filter(k => picks.some(p => SKILL_TESTS[k].test(p))),
    exp: exp ? exp[1] : 0,
    out: /main character|social butterfly/i.test(a.energy || ''),
    inn: /observer|mysterious/i.test(a.energy || ''),
    camYes: /^yes/i.test(a.device || ''),
    strict: /prefer my chosen role/i.test(a.reaction || ''),
  };
}

const variance = (xs) => {
  if (!xs.length) return 0;
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / xs.length;
};
const idOrder = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function crewStats(crew, byId) {
  const ps = crew.members.filter(m => m.personId && byId[m.personId]).map(m => byId[m.personId]);
  return {
    size: ps.length,
    covered: REQUIRED.filter(s => ps.some(p => p.skills.includes(s))),
    exp: ps.reduce((s, p) => s + p.exp, 0),
    out: ps.filter(p => p.out).length,
    inn: ps.filter(p => p.inn).length,
    cams: ps.filter(p => p.camYes).length,
  };
}

export function buildCrews(rows, wanted) {
  const people = rows.map(profile);
  const byId = {};
  people.forEach(p => { byId[p.id] = p; });
  const total = people.length;
  if (!total) return { crews: [], warnings: ['No one to put in crews yet.'] };

  const n = Math.max(1, Math.min(Math.floor(wanted) || 1, total));
  const crews = Array.from({ length: n }, (_, i) => ({ cap: Math.floor(total / n) + (i < total % n ? 1 : 0), members: [] }));
  const free = new Set(people.map(p => p.id));
  const has = (c, s) => c.members.some(m => byId[m.id].skills.includes(s));
  const expSum = (c) => c.members.reduce((t, m) => t + byId[m.id].exp, 0);
  const room = (c) => c.cap - c.members.length;
  const add = (c, p, role) => { c.members.push({ id: p.id, role }); free.delete(p.id); };
  const freeWith = (s) => people.filter(p => free.has(p.id) && p.skills.includes(s));
  const weakestFirst = (a, b) => a.members.length - b.members.length || expSum(a) - expSum(b);
  const actorCount = (c) => c.members.filter(m => m.role === 'Actor').length;

  // 1. Directors: the strongest directing people, one per crew
  freeWith('director')
    .sort((a, b) => b.exp - a.exp || b.camYes - a.camYes || b.out - a.out || idOrder(a, b))
    .slice(0, n)
    .forEach((p, i) => add(crews[i], p, 'Director'));

  // 2. Editors, cameras, writers: scarcest first, to crews that don't have that skill yet
  ['editor', 'camera', 'writer']
    .sort((a, b) => freeWith(a).length - freeWith(b).length)
    .forEach(skill => {
      crews.filter(c => !has(c, skill) && room(c) > 0).sort(weakestFirst).forEach(c => {
        const missing = REQUIRED.filter(s => !has(c, s));
        const covers = (p) => missing.filter(s => p.skills.includes(s)).length;
        const cand = freeWith(skill).sort((a, b) =>
          covers(b) - covers(a) ||
          (skill === 'camera' ? b.camYes - a.camYes : 0) ||
          b.exp - a.exp || idOrder(a, b))[0];
        if (cand) add(c, cand, ROLE_FOR[skill]);
      });
    });

  // 3. Actors: two per crew, people who mainly want to act first
  for (let round = 1; round <= 2; round++) {
    crews.filter(c => actorCount(c) < round && room(c) > 0).sort(weakestFirst).forEach(c => {
      const cand = freeWith('actor').sort((a, b) => a.skills.length - b.skills.length || b.exp - a.exp || idOrder(a, b))[0];
      if (cand) add(c, cand, 'Actor');
    });
  }

  // 4. Assistant director where there's room
  crews.filter(c => room(c) > 0).sort(weakestFirst).forEach(c => {
    const cand = freeWith('director').sort((a, b) => b.exp - a.exp || idOrder(a, b))[0];
    if (cand) add(c, cand, 'Assistant Director');
  });

  // 5. Everyone else fills the open spots, covering a missing skill if they have it
  people.filter(p => free.has(p.id)).sort((a, b) => b.exp - a.exp || idOrder(a, b)).forEach(p => {
    const c = crews.filter(x => room(x) > 0).sort((a, b) => room(b) - room(a) || expSum(a) - expSum(b))[0];
    if (!c) return;
    const gap = REQUIRED.find(s => !has(c, s) && p.skills.includes(s));
    const role = gap ? ROLE_FOR[gap]
      : p.skills.includes('actor') ? 'Actor'
      : p.skills.includes('camera') ? 'Camera (B-roll)'
      : p.skills.includes('sound') ? 'Sound'
      : 'Support';
    add(c, p, role);
  });

  // 6. PR & BTS: one outgoing extra person in crews of 5+, never someone who wants their chosen role
  crews.forEach(c => {
    if (c.members.length < 5) return;
    const pick = c.members
      .filter(m => (m.role === 'Support' || (m.role === 'Actor' && actorCount(c) > 2)) && !byId[m.id].strict)
      .sort((a, b) => byId[b.id].out - byId[a.id].out || idOrder(a, b))[0];
    if (pick) pick.role = 'PR & BTS';
  });

  // 7. Balance: swap people in the same role between crews while it makes crews more even
  const cost = () => {
    let c = 0;
    const exps = [], outs = [], ins = [], cams = [];
    crews.forEach(cr => {
      REQUIRED.forEach(s => { if (!has(cr, s)) c += 100; });
      const ps = cr.members.map(m => byId[m.id]);
      const sure = ps.filter(p => p.camYes).length;
      if (!sure) c += 60;
      exps.push(expSum(cr));
      outs.push(ps.filter(p => p.out).length);
      ins.push(ps.filter(p => p.inn).length);
      cams.push(sure);
    });
    return c + 4 * variance(exps) + 3 * variance(outs) + 3 * variance(ins) + 2 * variance(cams);
  };
  let current = cost();
  for (let iter = 0; iter < 300; iter++) {
    let best = null;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (const a of crews[i].members) {
          for (const b of crews[j].members) {
            if (a.role !== b.role) continue;
            [a.id, b.id] = [b.id, a.id];
            const c = cost();
            [a.id, b.id] = [b.id, a.id];
            if (c < current - 1e-6 && (!best || c < best.c)) best = { a, b, c };
          }
        }
      }
    }
    if (!best) break;
    [best.a.id, best.b.id] = [best.b.id, best.a.id];
    current = best.c;
  }

  // Honest warnings when there aren't enough people with a skill
  const warnings = [];
  REQUIRED.forEach(s => {
    const lacking = crews.filter(c => !has(c, s)).length;
    if (lacking) {
      const howMany = people.filter(p => p.skills.includes(s)).length;
      warnings.push(`${lacking} of ${n} crews have no ${SKILL_LABEL[s].toLowerCase()}: only ${howMany} people picked it. Use fewer crews, or assign someone by hand.`);
    }
  });
  const noCam = crews.filter(c => !c.members.some(m => byId[m.id].camYes)).length;
  if (noCam) warnings.push(`${noCam} ${noCam === 1 ? 'crew has' : 'crews have'} nobody who said “Yes, absolutely” to using their own camera.`);

  const rank = (role) => { const i = ROLE_OPTIONS.indexOf(role); return i === -1 ? 99 : i; };
  const stamp = Date.now().toString(36);
  return {
    crews: crews.map((c, i) => ({
      id: `c${i + 1}${stamp}`,
      name: `Crew ${i + 1}`,
      members: c.members.slice().sort((a, b) => rank(a.role) - rank(b.role)).map(m => ({ role: m.role, personId: m.id })),
    })),
    warnings,
  };
}