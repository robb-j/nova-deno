import { createDebug } from "./debug";

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

    const serverOptions = {
      path,
      args: ["lsp"],
      env: {
        NO_COLOR: "true",
      },
    };
    const clientOptions = {
      syntaxes: ["javascript", "typescript"],
      initializationOptions: config,
    };

    // This enables really deep debug logs
    // if (nova.inDevMode()) {
    //   serverOptions.args.push("--log-level", "debug");
    // }

    const client = new LanguageClient(
      "deno-langserver",
      "Deno Language Server",
      serverOptions,
      clientOptions
    );

    try {
      client.start();

      nova.subscriptions.add(client as any);

      this.languageClient = client;
    } catch (error) {
      debug("LSP Failed", error);
    }
  }

  stop() {
    debug("#stop");
    if (this.languageClient) {
      this.languageClient.stop();
      nova.subscriptions.remove(this.languageClient as any);
      this.languageClient = null;
    }
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
