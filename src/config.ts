import * as vscode from "vscode";

export interface VoiceConfig {
  microphone: string;
  language: "auto" | "en" | "fr";
  modelDir: string;
  vadThreshold: number;
  silenceTimeout: number;
  enableNotifications: boolean;
  enableWebview: boolean;
}

export function getConfig(): VoiceConfig {
  const cfg = vscode.workspace.getConfiguration("voicecode");
  return {
    microphone: cfg.get("microphone", "default"),
    language: cfg.get("language", "auto"),
    modelDir: cfg.get("modelDir", ""),
    vadThreshold: cfg.get("vadThreshold", 0.5),
    silenceTimeout: cfg.get("silenceTimeout", 1200),
    enableNotifications: cfg.get("enableNotifications", true),
    enableWebview: cfg.get("enableWebview", true),
  };
}
