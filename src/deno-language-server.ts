import { createDebug, debounce } from "./utils.js";

// Log stdin and stdout of the server to local files
const DEBUG_LSP_LOG = nova.inDevMode() && false;

const debug = createDebug("deno");

export class DenoLanguageServer {
  languageClient: LanguageClient | null = null;

  restart = debounce(200, () => {
    debug("restart");
    this.start();
  });

  constructor() {
    debug("#new");
  }

  start() {
    debug("#start");

    if (this.languageClient) {
      this.languageClient.stop();
      this.languageClient = null;
    }

    const serverOptions = {
      path: "/usr/bin/env",
      args: ["deno", "lsp", "--quiet"],
      env: {
        NO_COLOR: "true",
      },
    };
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
}
