import { DenoLanguageServer } from "./deno-language-server.js";
import { createDebug } from "./utils.js";

import { cacheCommand } from "./commands/cache.js";
import { initializeCommand } from "./commands/initialize.js";
import { formatCommand } from "./commands/format.js";
import { restartCommand } from "./commands/restart.js";
import { DenoTaskAssistant, tasksIdentifier } from "./tasks.js";

const debug = createDebug("main");

export function activate() {
  debug("#activate");

  const tasks = new DenoTaskAssistant(nova.workspace);

  nova.assistants.registerTaskAssistant(tasks, {
    identifier: tasksIdentifier,
    name: "Deno tasks",
  } as any); // TODO: there is a typo in the types for these options

  const langServer = new DenoLanguageServer();
  nova.subscriptions.add(langServer);

  // Watch for path changes and also initially start the Language Server
  nova.subscriptions.add(
    nova.config.observe("deno.path", (denoPath?: string) => {
      debug("denoPath changed", denoPath);
      langServer?.restart();

      nova.workspace.reloadTasks(tasksIdentifier);
    })
  );

  // Reload tasks when "deno.enable" or "deno.enablePaths" change
  nova.subscriptions.add(
    nova.workspace.config.observe("deno.enable", () => {
      nova.workspace.reloadTasks(tasksIdentifier);
    })
  );
  nova.subscriptions.add(
    nova.workspace.config.observe("deno.enablePaths", () => {
      nova.workspace.reloadTasks(tasksIdentifier);
    })
  );

  // Watch for deno.json changes to restart the server & reload tasks
  nova.subscriptions.add(
    nova.fs.watch("deno.json*", (path) => {
      debug("deno.json changed", path);

      // TODO: should the LSP do this itself?
      langServer?.restart();

      nova.workspace.reloadTasks(tasksIdentifier);
    })
  );

  nova.commands.register("deno.restart", (w) => restartCommand(w, langServer));
  nova.commands.register("deno.initialize", (w) => initializeCommand(w));
  nova.commands.register("deno.cache", (e) => cacheCommand(e, langServer));
  nova.commands.register("deno.format", (e) => formatCommand(e, langServer));
  nova.commands.register("deno.noFile", () => {
    nova.workspace.showErrorMessage("No file selected");
  });
}

export function deactivate() {
  debug("#deactivate");
}
