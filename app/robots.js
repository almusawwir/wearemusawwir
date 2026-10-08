const SITE = 'https://3amideas.club';

// Pages no crawler should index: API routes, the checkout form,
// and tickets (ticket URLs contain people's names).
const PRIVATE = ['/api/', '/register', '/ticket'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*',             allow: '/', disallow: PRIVATE },
      { userAgent: 'GPTBot',        allow: '/', disallow: PRIVATE }, // ChatGPT
      { userAgent: 'PerplexityBot', allow: '/', disallow: PRIVATE },
      { userAgent: 'ClaudeBot',     allow: '/', disallow: PRIVATE }, // Anthropic
      { userAgent: 'Googlebot',     allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}