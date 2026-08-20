import * as vscode from "vscode";
import { AppState } from "../state-machine";

export interface StatusBar {
  update(state: AppState, dictation?: boolean): void;
  show(): void;
  hide(): void;
  dispose(): void;
}

export function createStatusBar(): StatusBar {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = "voicecode.toggle";
  item.tooltip = "VoiceCode: Click to toggle recording";

  function getStateDisplay(state: AppState, dictation?: boolean) {
    switch (state) {
      case AppState.Idle:
        return {
          icon: "$(mic)",
          color: undefined,
          tooltip: "VoiceCode: Click to start recording (Ctrl+Shift+V)"
        };
      case AppState.Recording:
        if (dictation) {
          return {
            icon: "$(edit)",
            color: new vscode.ThemeColor("statusBarItem.warningBackground"),
            tooltip: "VoiceCode: Dictation mode active - Say 'arrête' to exit"
          };
        }
        return {
          icon: "$(record-red)",
          color: new vscode.ThemeColor("statusBarItem.warningBackground"),
          tooltip: "VoiceCode: Listening... Click to stop"
        };
      case AppState.Processing:
        return {
          icon: "$(sync~spin)",
          color: new vscode.ThemeColor("statusBarItem.errorBackground"),
          tooltip: "VoiceCode: Processing command..."
        };
    }
  }

  return {
    update(state: AppState, dictation?: boolean) {
      const display = getStateDisplay(state, dictation);
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
