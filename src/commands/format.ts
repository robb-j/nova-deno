import { createDebug, getEditorRange } from "../utils.js";
import type { DenoLanguageServer } from "../deno-language-server.js";
import type {
  DocumentFormattingParams,
  TextEdit,
} from "vscode-languageserver-protocol";

const debug = createDebug("format");

//
// Format a document using the Deno Language Server
//
export async function formatCommand(
  editor: TextEditor,
  langServer: DenoLanguageServer | null,
) {
  if (!langServer?.languageClient) {
    debug("LanguageServer isn't running");
    return;
  }

  const params: DocumentFormattingParams = {
    textDocument: {
      uri: editor.document.uri,
    },

    // just let deno handle it?
    // TODO: what options does Deno format take?
    options: {
      tabSize: editor.tabLength,
      insertSpaces: Boolean(editor.softTabs),
    },
  };

  debug("params", params);

  const result = (await langServer?.languageClient.sendRequest(
    "textDocument/formatting",
    params,
  )) as TextEdit[];

  if (!result) return;

  editor.edit((edit) => {
    for (const change of result.reverse()) {
      edit.replace(
        getEditorRange(editor.document, change.range),
        change.newText,
      );
    }
  });
}
