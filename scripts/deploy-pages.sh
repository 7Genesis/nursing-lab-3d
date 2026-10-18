#!/bin/sh
# Publica o build (dist/) na branch gh-pages do GitHub Pages. Uso: npm run build && sh scripts/deploy-pages.sh
set -e
REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)
cp -R dist/. "$TMP"
touch "$TMP/.nojekyll"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-deploy}" -c user.email="${GIT_AUTHOR_EMAIL:-deploy@users.noreply.github.com}" commit -q -m "deploy"
git push -q -f "$REMOTE" gh-pages
rm -rf "$TMP"
