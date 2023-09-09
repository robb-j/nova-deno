import type { Range as LspRange } from "vscode-languageserver-protocol";

/**
 * Generate a method for namespaced debug-only logging,
 * inspired by https://github.com/visionmedia/debug.
 *
 * - prints messages under a namespace
 * - only outputs logs when nova.inDevMode()
 * - converts object arguments to json
 */
export function createDebug(namespace: string) {
  return (...args: any[]) => {
    if (!nova.inDevMode()) return;

    const humanArgs = args.map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg) : arg,
    );
    console.info(`${namespace}:`, ...humanArgs);
  };
}

/**
 * Shamelessly stolen from
 * https://github.com/apexskier/nova-typescript/blob/2d4c1d8e61ca4afba6ee9ad1977a765e8cd0f037/src/lspNovaConversions.ts#L29
 */
export function getEditorRange(document: TextDocument, range: LspRange): Range {
  const fullContents = document.getTextInRange(new Range(0, document.length));
  let rangeStart = 0;
  let rangeEnd = 0;
  let chars = 0;
  const lines = fullContents.split(document.eol);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineLength = lines[lineIndex].length + document.eol.length;
    if (range.start.line === lineIndex) {
      rangeStart = chars + range.start.character;
    }
    if (range.end.line === lineIndex) {
      rangeEnd = chars + range.end.character;
      break;
    }
    chars += lineLength;
  }
  return new Range(rangeStart, rangeEnd);
}

/**
  Create a method that will never be called less that `ms` apart.
  If the method is called multiple times within that window it will only be executed
  `ms` milliseconds after the last call.
*/
export function debounce<T extends unknown[]>(
  ms: number,
  fn: (...args: T) => void,
) {
  let timerId: number | null;
  return (...args: T) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, ms);
  };
}

export function isDenoEnabled(config = nova.workspace.config): boolean {
  const enable = config.get("deno.enable", "boolean") ?? false;
  const enablePaths = config.get("deno.enablePaths", "array") ?? [];

  return enable || enablePaths.length > 0;
}

/** Ask the user in the current workspace pick an option */
export function pickOption(message: string, buttons: string[]) {
  return new Promise<string | null>((resolve) => {
    nova.workspace.showActionPanel(message, { buttons }, (chosenIndex) => {
      if (chosenIndex === null) resolve(null);
      else resolve(buttons[chosenIndex]);
    });
  });
}

/** Ask a yes/no question and get a boolean response (or null for no answer) */
export async function confirm(message: string) {
  const YES = nova.localize("Yes");
  const NO = nova.localize("No");

  const chosen = await pickOption(message, [YES, NO]);
  if (chosen === null) return null;
  return chosen === YES;
}
