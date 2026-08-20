import * as vscode from "vscode";

export interface EditorContext {
  getActiveEditor(): vscode.TextEditor | undefined;
  getActiveLanguage(): string;
  getCursorLine(): number;
  getCursorCharacter(): number;
  getSelectedText(): string | null;
  getFullText(): string;
}

export function createContext(): EditorContext {
  return {
    getActiveEditor() {
      return vscode.window.activeTextEditor;
    },

    getActiveLanguage() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return "plaintext";
      return editor.document.languageId;
    },

    getCursorLine() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return 0;
      return editor.selection.active.line + 1;
    },

    getCursorCharacter() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return 0;
      return editor.selection.active.character;
    },

    getSelectedText() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return null;
      const selection = editor.selection;
      if (selection.isEmpty) return null;
      return editor.document.getText(selection);
    },

    getFullText() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return "";
      return editor.document.getText();
    },
  };
}
