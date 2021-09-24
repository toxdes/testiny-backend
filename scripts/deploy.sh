#!/usr/bin/env bash
rm -rf node_modules dist
git fetch origin
git checkout main
git merge origin/main
git checkout dev
git merge origin/dev
yarn
yarn gen
yarn build
pm2 delete index
pm2 start dist/index.js