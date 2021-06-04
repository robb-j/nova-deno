#!/usr/bin/env bash

npx esbuild \
  --bundle \
  --format=cjs \
  --target=es6 \
  --platform=neutral \
  --outfile=Deno.novaextension/Scripts/main.dist.js \
  src/main.ts
