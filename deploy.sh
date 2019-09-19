#!/usr/bin/env bash

set -ex

git fetch origin master
dif=`git diff origin/master -- package.json`
git pull origin master
if [ -n "$dif" ] ;then
    npm install
fi
cd prisma
prisma deploy --env-file ../.env
cd ..
npm run build
pm2 restart API --env production
