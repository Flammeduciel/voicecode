let outputChannel: { appendLine(msg: string): void } | undefined;

export function initLogger(): void {
  try {
    const vscode = require("vscode");
    outputChannel = vscode.window.createOutputChannel("VoiceCode");
  } catch {
    outputChannel = {
      appendLine(msg: string) {
        console.log(msg);
      },
    };
  }
}

export function log(message: string): void {
  const ts = new Date().toISOString().slice(11, 23);
  outputChannel?.appendLine(`[${ts}] ${message}`);
}

export function logError(message: string, err?: unknown): void {
  const ts = new Date().toISOString().slice(11, 23);
  const suffix = err instanceof Error ? `: ${err.message}` : err ? `: ${String(err)}` : "";
  outputChannel?.appendLine(`[${ts}] ERROR ${message}${suffix}`);
}
