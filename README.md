# Hustle Stats

Source for [hustlestatsbasketball.com](https://hustlestatsbasketball.com): independent NBA analysis built from play-by-play and player-tracking data.

- **Shot Profile:** points per shot attempt above a baseline, split into decisions (selection, alignment, foul drawing) and execution (making, free throws), 2020-21 to now.
- **Hustle Plus-Minus:** points per 100 possessions a player adds through hustle, built from directly valued plays (steals, blocks, charges, rebounding RAPM) and data-weighted tracking stats.
- **The Hustle Report:** weekly column, pulled live from Substack by a Cloudflare Pages Function (`functions/api/hustle-report.js`).

Static site: plain HTML, CSS and JavaScript, with each tool's data in `data/` as JSON. Hosted on Cloudflare Pages and refreshed weekly during the season.

Not affiliated with or endorsed by the NBA or any team.
