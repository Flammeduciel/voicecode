import * as vscode from "vscode";

export interface VoiceConfig {
  language: "en" | "fr";
  enableNotifications: boolean;
}

export function getConfig(): VoiceConfig {
  const cfg = vscode.workspace.getConfiguration("voicecode");
  return {
    language: cfg.get("language", "fr"),
    enableNotifications: cfg.get("enableNotifications", true),
  };
}
