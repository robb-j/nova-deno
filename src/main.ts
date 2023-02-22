import { DenoLanguageServer } from "./deno-language-server.js";
import { createDebug } from "./utils.js";

import { cacheCommand } from "./commands/cache.js";
import { initializeCommand } from "./commands/initialize.js";
import { formatCommand } from "./commands/format.js";
import { restartCommand } from "./commands/restart.js";

const debug = createDebug("main");
let langServer: DenoLanguageServer | null = null;

export function activate() {
  debug("#activate");

  langServer = new DenoLanguageServer();
}

export function deactivate() {
  debug("#deactivate");

  if (langServer) {
    langServer.deactivate();
    langServer = null;
  }
}

nova.commands.register("deno.restart", (w) => restartCommand(w, langServer));
nova.commands.register("deno.initialize", (w) => initializeCommand(w));
nova.commands.register("deno.cache", (e) => cacheCommand(e, langServer));
nova.commands.register("deno.format", (e) => formatCommand(e, langServer));
