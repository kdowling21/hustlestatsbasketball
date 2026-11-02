// Hustle Stats site worker.
// Serves the static site from ./public, plus one live endpoint:
//   GET /api/hustle-report  -> latest Substack columns as JSON (cached ~15 minutes at Cloudflare's edge),
// so a new Monday column appears on the site within about 15 minutes of publishing.
const FEED = 'https://hustlestatsball.substack.com/feed';

const pick = (xml, tag) => {
  const m = xml.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
};
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’')
  .replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const json = (obj, maxAge) => new Response(JSON.stringify(obj), {
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${maxAge}` },
});

async function hustleReport() {
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'hustlestatsbasketball.com' }, cf: { cacheTtl: 900, cacheEverything: true } });
    if (!res.ok) throw new Error('feed ' + res.status);
    const xml = await res.text();
    const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12).map(([, it]) => {
      const image = (it.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/) || [])[1] || '';
      return { title: text(pick(it, 'title')), link: pick(it, 'link'), date: pick(it, 'pubDate'), summary: text(pick(it, 'description')).slice(0, 280), image };
    }).filter((p) => p.title && p.link);
    return json({ updated: new Date().toISOString(), posts }, 900);
  } catch (e) {
    return json({ posts: [], error: 'The Substack feed could not be read right now.' }, 120);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/hustle-report') return hustleReport();
    return env.ASSETS.fetch(request);
  },
};
