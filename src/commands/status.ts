import type { DenoLanguageServer } from "../deno-language-server.js";
import { createDebug } from "../utils.js";

const debug = createDebug("about");

// {
//   "title": "Deno Status",
//   "command": "deno.status"
// }

//
// WIP - Status Command
// Show the Deno status page using a virtual document
//
// NOTE: Nova doesn't support virtual documents
// https://devforum.nova.app/t/opening-virtual-lsp-definitions/1059
//
export async function statusCommand(
  workspace: Workspace,
  langServer: DenoLanguageServer | null
) {
  debug("status");

  if (!langServer?.languageClient) {
    debug("LanguageServer isn't running");
    return;
  }

  const file = await workspace.openNewTextDocument({
    syntax: "markdown",
  });

  debug(file);

  const response = await langServer.languageClient.sendRequest(
    "deno/virtualTextDocument",
    {
      textDocument: { uri: file?.document.uri },
    }
  );

  debug(response);
}
