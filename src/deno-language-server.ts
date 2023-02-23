import {
  createDebug,
  debounce,
  defaultDenoPath,
  getDenoPath,
} from "./utils.js";

// Log stdin and stdout of the server to local files
const DEBUG_LSP_LOG = nova.inDevMode() && false;

const debug = createDebug("deno");

export class DenoLanguageServer {
  languageClient: LanguageClient | null = null;

  restart = debounce(200, () => {
    debug("restart");
    this.start(getDenoPath());
  });

  constructor() {
    debug("#new");
  }

  start(denoPath: string | null) {
    debug("#start", denoPath);

    if (this.languageClient) {
      this.languageClient.stop();
      this.languageClient = null;
    }

    denoPath ??= defaultDenoPath;

    const serverOptions = this.getServerOptions(
      denoPath,
      DEBUG_LSP_LOG ? nova.workspace.path : null
    );
    debug("serverOptions", serverOptions);

    const clientOptions = {
      syntaxes: ["javascript", "jsx", "typescript", "tsx"], // "markdown"?
    };
    debug("clientOptions", clientOptions);

    // This enables really deep debug logs
    // if (nova.inDevMode()) {
    //   serverOptions.args.push("--log-level", "debug");
    // }

    try {
      const client = new LanguageClient(
        "robb-j.deno",
        "Deno Language Server",
        serverOptions,
        clientOptions
      );

      this.languageClient = client;

      client.start();

      this.setupClient(client);
    } catch (error) {
      debug("LSP Failed", error);
    }
  }

  setupClient(_client: LanguageClient) {
    // ...
  }

  dispose() {
    debug("#dispose");
    this.stop();
  }

  stop() {
    debug("#stop");
    if (this.languageClient) {
      this.languageClient.stop();
      this.languageClient = null;
    }
  }

  getServerOptions(denoPath: string, debugPath: string | null) {
    if (debugPath) {
      const stdinLog = nova.path.join(debugPath, "stdin.log");
      const stdoutLog = nova.path.join(debugPath, "stdout.log");

      return {
        path: "/bin/sh",
        args: [
          "-c",
          `tee "${stdinLog}" | ${denoPath} lsp | tee "${stdoutLog}"`,
        ],
        env: {
          NO_COLOR: "true",
        },
      };
    }

    return {
      path: denoPath,
      args: ["lsp"],
      env: {
        NO_COLOR: "true",
      },
    };
  }
}
