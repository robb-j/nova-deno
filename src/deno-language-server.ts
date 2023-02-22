import { createDebug, debounce } from "./utils.js";

// Log stdin and stdout of the server to local files
const DEBUG_LSP_LOG = nova.inDevMode() && false;

const debug = createDebug("deno");

export class DenoLanguageServer {
  languageClient: LanguageClient | null = null;
  disposables = new CompositeDisposable();

  restart = debounce(200, () => {
    debug("restart");
    this.start(nova.config.get("deno.path", "string"));
  });

  constructor() {
    debug("#new");

    this.disposables.add(
      nova.config.observe("deno.path", (newPath: string | null) => {
        debug("denoPath changed", newPath);
        this.restart();
      })
    );

    if (nova.workspace.path) {
      this.disposables.add(
        nova.fs.watch("deno.json*", (path) => {
          debug("deno.json changed", path);
          this.restart();
        })
      );
    }
  }

  deactivate() {
    debug("#deactivate");

    this.stop();
    this.disposables.dispose();
  }

  start(denoPath: string | null) {
    debug("#start", denoPath);

    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
      this.languageClient = null;
    }

    denoPath ??= "/usr/local/bin/deno";

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

      nova.subscriptions.add(client as any);
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

  stop() {
    debug("#stop");
    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
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
