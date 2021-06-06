import { DenoLanguageServer } from "./deno-language-server";
import { createDebug } from "./debug";

import { cacheCommand, initializeCommand } from "./commands/all";

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

nova.commands.register("deno.initialize", (w) => initializeCommand(w));
nova.commands.register("deno.cache", (w) => cacheCommand(w, langServer));

// WIP
// nova.commands.register("deno.status", (w) => statusCommand(w, langServer));
