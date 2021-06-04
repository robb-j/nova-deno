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
      typeof arg === "object" ? JSON.stringify(arg) : arg
    );
    console.info(`${namespace}: `, ...humanArgs);
  };
}
