import { createDebug } from "../utils.js";
import type { DenoLanguageServer } from "../deno-language-server.js";

const debug = createDebug("restart");

export function restartCommand(
  workspace: Workspace,
  langServer: DenoLanguageServer | null,
) {
  debug("start");
  langServer?.restart();
}
