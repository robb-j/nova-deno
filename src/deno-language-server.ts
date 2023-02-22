import { createDebug, debounce } from "./utils.js";

// Log stdin and stdout of the server to local files
const DEBUG_LSP_LOG = nova.inDevMode() && false;

const debug = createDebug("deno");

let i = 0;

export class DenoLanguageServer {
  languageClient: LanguageClient | null = null;
  disposables = new CompositeDisposable();

  restart = debounce(200, (denoPath: string | null) => {
    debug("restart");
    this.start(denoPath);
  });

  constructor() {
    debug("#new");

    let denoPath: string | null = null;

    this.disposables.add(
      nova.config.observe("deno.path", (path: string | null) => {
        debug("denoPath changed");
        denoPath = path;
        this.restart(path);
      })
    );

    if (nova.workspace.path) {
      this.disposables.add(
        nova.fs.watch("deno.json*", (path) => {
          debug("deno.json changed", path);
          this.restart(denoPath);
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
    debug("#start", denoPath, i++);

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

  setupClient(client: LanguageClient) {
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
