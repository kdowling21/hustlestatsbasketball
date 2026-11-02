#!/bin/bash
# Publish the Hustle Stats site: commit everything in this folder and push it to GitHub.
# Cloudflare Pages rebuilds hustlestatsbasketball.com from GitHub within a minute or two.
set -e
cd "$(dirname "$0")"
if [ ! -d .git ]; then
  git init -b main
  git remote add origin https://github.com/kdowling21/hustlestatsbasketball.git
fi
git add -A
git commit -m "Site update $(date '+%Y-%m-%d %H:%M')" || echo "Nothing new to publish."
git push -u origin main
echo "Published. The live site updates in about a minute."
