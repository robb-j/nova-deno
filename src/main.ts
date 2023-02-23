import { DenoLanguageServer } from "./deno-language-server.js";
import { createDebug } from "./utils.js";

import { cacheCommand } from "./commands/cache.js";
import { initializeCommand } from "./commands/initialize.js";
import { formatCommand } from "./commands/format.js";
import { restartCommand } from "./commands/restart.js";

const debug = createDebug("main");
let langServer: DenoLanguageServer | null = null;
const disposables = new CompositeDisposable();

export function activate() {
  debug("#activate");

  langServer = new DenoLanguageServer();

  // Watch for path changes and also initially start the server
  disposables.add(
    nova.config.observe("deno.path", (newPath: string | null) => {
      debug("denoPath changed", newPath);
      langServer?.restart();
    })
  );

  // Watch for deno.json changes and restart the server
  // TODO: should the server do this itself?
  if (nova.workspace.path) {
    disposables.add(
      nova.fs.watch("deno.json*", (path) => {
        debug("deno.json changed", path);
        langServer?.restart();
      })
    );
  }
}

export function deactivate() {
  debug("#deactivate");

  if (langServer) {
    langServer.stop();
    langServer = null;
  }
}

nova.commands.register("deno.restart", (w) => restartCommand(w, langServer));
nova.commands.register("deno.initialize", (w) => initializeCommand(w));
nova.commands.register("deno.cache", (e) => cacheCommand(e, langServer));
nova.commands.register("deno.format", (e) => formatCommand(e, langServer));
