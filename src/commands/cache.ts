import { createDebug } from "../utils.js";
import type { DenoLanguageServer } from "../deno-language-server.js";

const debug = createDebug("cache");
const syntaxes = new Set(["typescript", "javascript", "tsx", "jsx"]);

//
// This command runs "deno cache" via the Language Server
//
export async function cacheCommand(
  textEditor: TextEditor,
  langServer: DenoLanguageServer | null,
) {
  if (!langServer?.languageClient) {
    debug("LanguageServer isn't running");
    return;
  }

  const referrer = {
    uri: textEditor.document.uri,
  };

  const uris = nova.workspace.textEditors
    .filter((e) => e.document.syntax && syntaxes.has(e.document.syntax))
    .map((e) => ({ uri: e.document.uri }));

  debug("cache", referrer.uri, uris);

  await langServer.languageClient.sendRequest("deno/cache", {
    referrer,
    uris,
  });
}
