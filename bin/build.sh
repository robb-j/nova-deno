#!/usr/bin/env bash

set -e

npx tsc --noEmit --pretty

npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=Deno.novaextension/Scripts/main.dist.js \
  src/main.ts
