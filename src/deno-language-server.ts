import { createDebug } from "./debug";

const DEBUG_LSP_LOG = false;
const debug = createDebug("deno");

export class DenoLanguageServer {
  languageClient: LanguageClient | null = null;

  constructor() {
    debug("#new");

    nova.config.observe("deno.path", (path: string | null) => {
      this.start(path);
    });
  }

  deactivate() {
    debug("#deactivate");

    this.stop();
  }

  start(path: string | null) {
    debug("#start", path);

    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
      this.languageClient = null;
    }

    if (!path) {
      path = "/usr/local/bin/deno";
    }

    const config = this.getConfig();
    debug("config", config);

    const serverOptions = this.getServerOptions(
      path,
      DEBUG_LSP_LOG ? nova.workspace.path : null
    );
    debug("serverOptions", serverOptions);

    const clientOptions = {
      syntaxes: ["javascript", "typescript"],
      initializationOptions: config,
    };
    debug("clientOptions", clientOptions);

    // This enables really deep debug logs
    // if (nova.inDevMode()) {
    //   serverOptions.args.push("--log-level", "debug");
    // }

    const client = new LanguageClient(
      "robb-j.deno",
      "Deno Language Server",
      serverOptions,
      clientOptions
    );

    try {
      this.setupClient(client);

      client.start();

      nova.subscriptions.add(client as any);

      this.languageClient = client;
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

  getConfig() {
    const workspace = nova.workspace.config;
    const extension = nova.config;

    const enable = workspace.get("deno.enable", "boolean") ?? false;
    const lint = workspace.get("deno.lint", "boolean") ?? false;
    const unstable = workspace.get("deno.unstable", "boolean") ?? false;
    const internalDebug =
      extension.get("deno.internalDebug", "boolean") ?? false;

    // const suggest: any = {
    //   completeFunctionCalls: extension.get(
    //     "deno.suggest.completeFunctionCalls",
    //     "boolean"
    //   ),
    //   names: extension.get("deno.suggest.names", "boolean"),
    //   paths: extension.get("deno.suggest.paths", "boolean"),
    //   autoImports: extension.get("deno.suggest.autoImports", "boolean"),
    //   imports: {
    //     autoDiscover: extension.get(
    //       "deno.suggest.imports.autoDiscover",
    //       "boolean"
    //     ),
    //     // hosts: extension.get("deno.suggest.imports.hosts", "array"),
    //   },
    // };

    return { enable, lint, unstable, internalDebug /*, suggest*/ };
  }
}
