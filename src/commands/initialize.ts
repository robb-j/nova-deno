import { createDebug } from "../utils.js";

const debug = createDebug("initialize");

const YES = nova.localize("Yes");
const NO = nova.localize("No");
const OK = nova.localize("OK");
const CONFIGURE = nova.localize("Configure");

/** Ask the user in the current workspace pick an option */
function pickOption(message: string, buttons: string[], workspace: Workspace) {
  return new Promise<string | null>((resolve) => {
    workspace.showActionPanel(message, { buttons }, (chosenIndex) => {
      if (chosenIndex === null) resolve(null);
      else resolve(buttons[chosenIndex]);
    });
  });
}

/** Ask a yes/no question and get a boolean response (or null for no answer) */
async function confirm(message: string, workspace: Workspace) {
  const chosen = await pickOption(message, [YES, NO], workspace);
  if (chosen === null) return null;
  return chosen === YES;
}

//
// This is a command to setup a workspace to run with Deno,
// asking options about how to configure Deno
//
export async function initializeCommand(workspace: Workspace) {
  debug("initialize");

  // If already enabled, let the user know and offer a link to configuration
  if (workspace.config.get("deno.enable", "boolean")) {
    const chosen = await pickOption(
      "Deno is already enabled",
      [OK, CONFIGURE],
      workspace
    );
    if (chosen === CONFIGURE) {
      workspace.openConfig("robb-j.deno");
    }
    return;
  }

  const linter = await confirm("Enable linter?", workspace);
  if (linter === null) return;

  const unstable = await confirm("Use --unstable features?", workspace);
  if (unstable === null) return;

  workspace.config.set("deno.enable", true);
  workspace.config.set("deno.lint", linter);
  workspace.config.set("deno.unstable", unstable);
}
