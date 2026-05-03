import Papa from 'papaparse';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSSCmEDqxpPn1OEzXR3geUaynoeGhrswVO5xf8zKETC8xOq1oimP1SiapOAsSPY_nEMTHoDeacTgKC/pub?gid=0&single=true&output=csv";

export default async function sitemap() {
  const res = await fetch(CSV_URL, { next: { revalidate: 3600 } });
  const text = await res.text();

  const events = await new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
      complete: (results) => resolve(results.data),
    });
  });

  const eventUrls = events
    .filter(e => e.id)
    .map((event) => ({
      url: `https://almusawwir.art/event/${event.id.trim()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    {
      url: 'https://almusawwir.art',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...eventUrls,
  ];
}