#!/usr/bin/env bash
echo "--- [CLEANING] ---" && \
rm -rf node_modules dist && \
echo "--- [FETCHING LATEST CHANGES] ---" && \
git fetch origin && \
git checkout main && \
git merge origin/main && \
git checkout dev && \
git merge origin/dev && \
echo "--- [FETCHING DEPENDENCIES] ---" && \
yarn && \
echo "--- [EDITING .env file] ---" && \
# cp sample.env .env && \
cp ~/secret-env .env && \
# vi .env && \
source .env && \
yarn gen && \
yarn build && \
pm2 delete index && \
pm2 start dist/index.js