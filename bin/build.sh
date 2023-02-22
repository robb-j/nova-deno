#!/usr/bin/env bash

# Ensure the build fails if TypeScript fails
set -e

# Lint TypeScript source code
npx tsc --noEmit --pretty

npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=Deno.novaextension/Scripts/main.dist.js \
  src/main.ts
