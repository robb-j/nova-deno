import stripJsonComments from "strip-json-comments";

import { createDebug, isDenoEnabled } from "./utils.js";

const debug = createDebug("tasks");

function parseJsonc(input: string) {
  return JSON.parse(
    stripJsonComments(input, {
      trailingCommas: true,
    }),
  );
}

interface RoughDenoConfig {
  tasks?: Record<string, string>;
}

export const tasksIdentifier = "robb-j.deno.tasks";

const testFlags = new Map(
  Object.entries({
    "robb-j.deno.testAllowRead": "--allow-read",
    "robb-j.deno.testAllowEnv": "--allow-env",
    "robb-j.deno.testAllowRun": "--allow-run",
    "robb-j.deno.testAllowFfi": "--allow-ffi",
    "robb-j.deno.testAllowHrtime": "--allow-hrtime",
    "robb-j.deno.testAllowNet": "--allow-net",
    "robb-j.deno.testAllowSys": "--allow-sys",
    "robb-j.deno.testAllowWrite": "--allow-write",
  }),
);

// IDEA: Turn on/off "base" tasks with workspace configuration?

export class DenoTaskAssistant implements TaskAssistant {
  constructor(public workspace: Workspace) {}

  baseTasks(): Task[] {
    const test = new Task("test");
    test.name = "Test";
    test.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { command: "test" } }),
    );

    const format = new Task("format");
    format.name = "Format";
    format.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { command: "fmt" } }),
    );

    return [test, format];
  }

  resolveTaskAction(
    context: TaskActionResolveContext<any>,
  ): ResolvedTaskAction {
    const data = context.data as { command: string };

    const args = ["deno", data.command];

    if (data.command === "test") {
      args.push(
        ...Array.from(testFlags)
          .filter((entry) => this.workspace.config.get(entry[0], "boolean"))
          .map((entry) => entry[1]),
      );
    }

    if (
      nova.workspace.activeTextEditor &&
      nova.workspace.activeTextEditor.document.path
    ) {
      args.push(nova.workspace.activeTextEditor.document.path);
    } else {
      return new TaskCommandAction("deno.noFile");
    }

    debug("resolveTask", args);

    return new TaskProcessAction("/usr/bin/env", { args });
  }

  provideTasks(): Task[] {
    debug("provideTasks");

    if (!isDenoEnabled()) return [];

    return [
      ...this.baseTasks(),
      ...this.getConfigTasks("deno.json"),
      ...this.getConfigTasks("deno.jsonc"),
    ];
  }

  getConfigTasks(configFilename: string): Task[] {
    if (!this.workspace.path) return [];

    const configPath = nova.path.join(this.workspace.path, configFilename);

    const stat = nova.fs.stat(configPath);
    if (!stat || !stat.isFile()) return [];

    try {
      const file = nova.fs.open(configPath, "r", "utf8") as FileTextMode;
      const config: RoughDenoConfig = parseJsonc(file.read() ?? "");
      file.close();

      debug("config", config);

      if (!config.tasks || typeof config.tasks !== "object") return [];

      let tasks: Task[] = [];

      for (const taskName of Object.keys(config.tasks)) {
        if (typeof taskName !== "string") {
          debug("skip task", taskName);
          continue;
        }

        const task = new Task(`task.${taskName}`);
        task.name = `Task: ${taskName}`;
        task.setAction(
          Task.Run,
          new TaskProcessAction("/usr/bin/env", {
            args: ["deno", "task", taskName],
          }),
        );

        tasks.push(task);
      }

      return tasks;
    } catch (error) {
      debug(`failed to parse ${configFilename}`, error);
      return [];
    }
  }
}
