# Deno for Nova

- https://github.com/denoland/deno/tree/main/cli/lsp
- https://github.com/denoland/vscode_deno
- https://github.com/denoland/deno/issues/8643

Logo from https://github.com/kevinkassimo / https://ksm.sh
and slightly modified (full size and white inner background)

---

## sticking points

### completions aren't working

When typing the server is failing to generate completions.
For instance adding `r` to **examples/server.ts**'s for loop,
which should complete to `req` produces this error:

```txt
Unable to get completion info from TypeScript: Error: Debug Failure. Illegal value: "r"
  at isValidTrigger (deno:cli/tsc/00_typescript.js:122443:37)
  at Object.getCompletionsAtPosition (deno:cli/tsc/00_typescript.js:120179:92)
  at Object.getCompletionsAtPosition (deno:cli/tsc/00_typescript.js:149797:35)
  at serverRequest (deno:cli/tsc/99_main_compiler.js:632:27)
  at [native_code]:1:12

Internal error
```

### mapping `deno.suggest.imports.hosts`

Deno expects a `Record<string, boolean> from this configuration` so I've omitted it for now

```json
{
  "key": "deno.suggest.imports.hosts",
  "title": "",
  "type": "stringArray",
  "default": []
}
```

## future work

- `deno fmt` support ~ look into how prettier does formatting
  - can it work in the same namespace as prettier?
- auto cache based on LSP responses
- check the deno version on startup
- better filtering of `uris` for deno cache / understand what its doing
- implement `deno/reloadImportRegistries` request as a command
- implement `deno/virtualTextDocument` request as a command
  - I don't tihnk nova lets us create a virtual document like VSCode does?
- configure command `when` field
- experiment with editor/workspace commands
- test jsx/tsx support
