#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ "$(git branch --show-current)" != source ]]; then
  echo 'Run deployment from the source branch.' >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Commit your source changes before deploying.' >&2
  exit 1
fi

npm run build
git push -u origin source

deploy_dir=$(mktemp -d)
trap 'rm -rf "$deploy_dir"' EXIT
git clone --single-branch --branch main "$(git remote get-url origin)" "$deploy_dir"
git -C "$deploy_dir" config user.name "$(git config user.name)"
git -C "$deploy_dir" config user.email "$(git config user.email)"
git -C "$deploy_dir" rm -r --ignore-unmatch .
cp -R dist/. "$deploy_dir/"
touch "$deploy_dir/.nojekyll"
git -C "$deploy_dir" add -A
if git -C "$deploy_dir" diff --cached --quiet; then
  echo 'The published site is already up to date.'
else
  git -C "$deploy_dir" commit -m "Deploy site from $(git rev-parse --short HEAD)"
  git -C "$deploy_dir" push origin main
fi
