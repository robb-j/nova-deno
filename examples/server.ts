import * as http from "https://deno.land/std@0.97.0/http/server.ts";

const server = http.serve({ port: 8000 });

console.log("http://localhost:8000/");

for await (const req of server) {
  req.respond({ body: "Hello World\n" });
}
