import { createDebug, confirm, pickOption } from "../utils.js";

const debug = createDebug("initialize");

const OK = nova.localize("OK");
const CONFIGURE = nova.localize("Configure");

//
// This is a command to setup a workspace to run with Deno,
// asking options about how to configure Deno
//
export async function initializeCommand(workspace: Workspace) {
  debug("initialize");

  // If already enabled, let the user know and offer a link to configuration
  if (workspace.config.get("deno.enable", "boolean")) {
    const chosen = await pickOption("Deno is already enabled", [OK, CONFIGURE]);
    if (chosen === CONFIGURE) {
      workspace.openConfig("robb-j.deno");
    }
    return;
  }

  const linter = await confirm("Enable linter?");
  if (linter === null) return;

  const unstable = await confirm("Use --unstable features?");
  if (unstable === null) return;

  workspace.config.set("deno.enable", true);
  workspace.config.set("deno.lint", linter);
  workspace.config.set("deno.unstable", unstable);
}
