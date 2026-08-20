import * as vscode from "vscode";
import { AppState } from "../state-machine";

export interface StatusBar {
  update(state: AppState, text?: string): void;
  show(): void;
  hide(): void;
  dispose(): void;
}

export function createStatusBar(): StatusBar {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = "voicecode.toggle";
  item.tooltip = "VoiceCode: Click to toggle recording";

  function getStateDisplay(state: AppState, text?: string) {
    switch (state) {
      case AppState.Idle:
        return { icon: "$(mic)", color: undefined, tooltip: "VoiceCode: Click to start" };
      case AppState.Recording:
        return {
          icon: "$(record-red)",
          color: new vscode.ThemeColor("statusBarItem.warningBackground"),
          tooltip: text ? `Listening: ${text}` : "VoiceCode: Listening...",
        };
      case AppState.Processing:
        return {
          icon: "$(sync~spin)",
          color: new vscode.ThemeColor("statusBarItem.errorBackground"),
          tooltip: "VoiceCode: Processing...",
        };
    }
  }

  return {
    update(state: AppState, text?: string) {
      const display = getStateDisplay(state, text);
      item.text = ` ${display.icon} VoiceCode `;
      item.color = display.color;
      item.backgroundColor = display.color;
      item.tooltip = display.tooltip;
    },

    show() {
      item.show();
    },

    hide() {
      item.hide();
    },

    dispose() {
      item.dispose();
    },
  };
}
