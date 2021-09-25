#!/usr/bin/env bash
echo "--- [CLEANING] ---" && \
rm -rf node_modules dist && \
echo "--- [FETCHING LATEST CHANGES] ---" && \
git stash && \
git fetch origin && \
git checkout main && \
git merge origin/main && \
git checkout dev && \
git merge origin/dev && \
echo "--- [FETCHING DEPENDENCIES] ---" && \
yarn && \
echo "--- [EDITING .env file] ---" && \
# cp sample.env .env && \
# vim .env && \
# using this currently because got tired of writing env secrets on every push
cp ~/secret-env .env && \
echo "--- [BUILDING] ---" && \
source .env && \
yarn gen && \
yarn build && \
echo "--- [REFRESHING PM2 ENTRY] ---" && \
pm2 delete index && \
pm2 start dist/index.js