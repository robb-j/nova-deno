import { DenoLanguageServer } from "../deno-language-server";
import { createDebug } from "../debug";

const debug = createDebug("about");

// {
//   "title": "Deno Status",
//   "command": "deno.status"
// }

//
// WIP - Status Command
// Show the Deno status page using a virtual document
//
export async function statusCommand(
  workspace: Workspace,
  langServer: DenoLanguageServer | null
) {
  debug("about");

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
