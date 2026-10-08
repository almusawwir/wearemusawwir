import Papa from 'papaparse';

const SITE = 'https://3amideas.club';
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

export default async function sitemap() {
  const now = new Date();

  const staticPages = [
    { path: '',       changeFrequency: 'daily',   priority: 1.0 },
    { path: '/event', changeFrequency: 'daily',   priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/join',  changeFrequency: 'monthly', priority: 0.6 },
    { path: '/terms', changeFrequency: 'yearly',  priority: 0.3 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let eventUrls = [];
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 3600 } });
    const text = await res.text();
    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
    });

    eventUrls = data
      .filter((e) => e.id && e.id.trim())
      .map((event) => ({
        url: `${SITE}/event/${encodeURIComponent(event.id.trim())}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch {
    // If the sheet can't be reached, still publish the main pages
  }

  return [...staticPages, ...eventUrls];
}