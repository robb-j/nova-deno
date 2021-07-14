# Deno for Nova

> :warning: This extension and [Deno Language Server](https://github.com/denoland/deno/tree/main/cli/lsp) are both experimental.

Write Deno scripts in Nova.

See the [Extension readme](/Deno.novaextension/README.md) for more information,
the [changelog](/Deno.novaextension/CHANGELOG.md) for updates
or [development notes](/DEV.md) behind-the-scenes.

**todos**

- [x] Setup the project
- [x] Run `deno lsp` with a Nova `LanguageServer`
- [x] `cache` command to tell Deno to fetch dependencies
- [x] `initialize` command to turn on Deno for a project
- [x] pass `initializationOptions` based on Nova extension/workspace config
- [ ] Work out why completions aren't working - #1
- [ ] Write the extension readme
- [ ] Work out why code actions aren't working
- [ ] Get support for virtual files in nova
      deno opens up `deno:/` files for definitions and the status page #2.
      https://code.visualstudio.com/api/extension-guides/virtual-documents
