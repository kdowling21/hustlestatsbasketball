// Cloudflare Pages Function: GET /api/hustle-report
// Reads the Hustle Stats Substack feed and returns the latest posts as JSON.
// Cached at Cloudflare's edge for 15 minutes, so a new Monday column appears on the site within ~15 minutes of publishing.
const FEED = 'https://hustlestatsball.substack.com/feed';

const pick = (xml, tag) => {
  const m = xml.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>'));
  if (!m) return '';
  return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
};
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’')
  .replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

export async function onRequest() {
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'hustlestatsbasketball.com' }, cf: { cacheTtl: 900, cacheEverything: true } });
    if (!res.ok) throw new Error('feed ' + res.status);
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12).map(([, it]) => {
      const img = (it.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/) || [])[1] || '';
      const desc = text(pick(it, 'description'));
      return { title: text(pick(it, 'title')), link: pick(it, 'link'), date: pick(it, 'pubDate'), summary: desc.slice(0, 280), image: img };
    }).filter((p) => p.title && p.link);
    return new Response(JSON.stringify({ updated: new Date().toISOString(), posts: items }), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ posts: [], error: 'The Substack feed could not be read right now.' }), {
      status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=120' },
    });
  }
}
