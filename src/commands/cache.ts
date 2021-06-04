import { createDebug } from "../debug";
import { DenoLanguageServer } from "../deno-language-server";

const debug = createDebug("cache");
const syntaxes = new Set(["typescript", "javascript", "tsx", "jsx"]);

//
// This command runs "deno cache" via the Language Server
//
export async function cacheCommand(
  workspace: Workspace,
  langServer: DenoLanguageServer | null
) {
  if (!langServer?.languageClient) {
    debug("LanguageServer isn't running");
    return;
  }

  const referrer = {
    uri: workspace.activeTextEditor.document.uri,
  };

  const uris = workspace.textEditors
    .filter((e) => e.document.syntax && syntaxes.has(e.document.syntax))
    .map((e) => ({ uri: e.document.uri }));

  debug("cache", referrer.uri, uris);

  await langServer.languageClient.sendRequest("deno/cache", {
    referrer,
    uris,
  });
}
