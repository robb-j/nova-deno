#!/usr/bin/env deno run --allow-net

Deno.serve({ port: 9000 }, async (request) => {
  return Response.json({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
  })
})
