import stripJsonComments from "strip-json-comments";

import { createDebug, isDenoEnabled } from "./utils.js";

const debug = createDebug("tasks");

function parseJsonc(input: string) {
  return JSON.parse(
    stripJsonComments(input, {
      trailingCommas: true,
    })
  );
}

interface RoughDenoConfig {
  tasks?: Record<string, string>;
}

export const tasksIdentifier = "robb-j.deno.tasks";

// IDEA: Turn on/off "base" tasks with workspace configuration?

export class DenoTaskAssistant implements TaskAssistant {
  constructor(public denoPath: string, public basePath: string | null) {}

  baseTasks(): Task[] {
    const test = new Task("test");
    test.name = "Test";
    test.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { command: "test" } })
    );

    const format = new Task("format");
    format.name = "Format";
    format.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { command: "fmt" } })
    );

    return [test, format];
  }

  resolveTaskAction(
    context: TaskActionResolveContext<any>
  ): ResolvedTaskAction {
    const data = context.data as { command: string };

    let args = [data.command];

    if (
      nova.workspace.activeTextEditor &&
      nova.workspace.activeTextEditor.document.path
    ) {
      args.push(nova.workspace.activeTextEditor.document.path);
    } else {
      return new TaskCommandAction("deno.noFile");
    }

    return new TaskProcessAction(this.denoPath, { args });
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
    if (!this.basePath) return [];

    const configPath = nova.path.join(this.basePath, configFilename);

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
          new TaskProcessAction(this.denoPath, {
            args: ["task", taskName],
          })
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
