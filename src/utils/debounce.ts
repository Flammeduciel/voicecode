import * as vscode from "vscode";

let timeout: ReturnType<typeof setTimeout> | undefined;

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): T {
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function showNotification(message: string, type: "info" | "warning" | "error" = "info"): void {
  switch (type) {
    case "error":
      vscode.window.showErrorMessage(`VoiceCode: ${message}`);
      break;
    case "warning":
      vscode.window.showWarningMessage(`VoiceCode: ${message}`);
      break;
    default:
      vscode.window.showInformationMessage(`VoiceCode: ${message}`);
  }
}
