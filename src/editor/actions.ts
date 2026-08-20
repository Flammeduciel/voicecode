import * as vscode from "vscode";
import { Intent, NLUResult } from "../nlu/intents";
import { log } from "../utils/logger";

export interface EditorActions {
  execute(result: NLUResult): Promise<boolean>;
}

export function createEditorActions(): EditorActions {
  return {
    async execute(result: NLUResult): Promise<boolean> {
      const editor = vscode.window.activeTextEditor;
      const cmd = vscode.commands.executeCommand;

      switch (result.intent) {
        case Intent.GoToLine: {
          const line = result.entities.line ?? 1;
          const pos = new vscode.Position(Math.max(0, line - 1), 0);
          if (editor) {
            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos));
          }
          return true;
        }

        case Intent.GoToStart:
          await cmd("cursorTop");
          return true;

        case Intent.GoToEnd:
          await cmd("cursorBottom");
          return true;

        case Intent.GoToLineStart:
          await cmd("cursorLineStart");
          return true;

        case Intent.GoToLineEnd:
          await cmd("cursorLineEnd");
          return true;

        case Intent.MoveUp: {
          const upCount = result.entities.count ?? 1;
          for (let i = 0; i < upCount; i++) await cmd("cursorUp");
          return true;
        }

        case Intent.MoveDown: {
          const downCount = result.entities.count ?? 1;
          for (let i = 0; i < downCount; i++) await cmd("cursorDown");
          return true;
        }

        case Intent.MoveLeft: {
          const leftCount = result.entities.count ?? 1;
          for (let i = 0; i < leftCount; i++) await cmd("cursorLeft");
          return true;
        }

        case Intent.MoveRight: {
          const rightCount = result.entities.count ?? 1;
          for (let i = 0; i < rightCount; i++) await cmd("cursorRight");
          return true;
        }

        case Intent.GoToFile: {
          const fileName = result.entities.file;
          if (fileName) {
            const files = await vscode.workspace.findFiles(`**/${fileName}`, "**/node_modules/**", 5);
            if (files.length > 0) {
              const doc = await vscode.workspace.openTextDocument(files[0]);
              await vscode.window.showTextDocument(doc);
            }
          }
          return true;
        }

        case Intent.GoToSymbol: {
          const symbol = result.entities.symbol;
          if (symbol) {
            await cmd("workbench.action.gotoSymbol");
            await vscode.commands.executeCommand("workbench.action.quickOpen", symbol);
          }
          return true;
        }

        case Intent.Undo:
          await cmd("editor.action.undo");
          return true;

        case Intent.Redo:
          await cmd("editor.action.redo");
          return true;

        case Intent.DeleteLine: {
          const line = result.entities.line;
          if (line && editor) {
            const pos = new vscode.Position(Math.max(0, line - 1), 0);
            const lineRange = editor.document.lineAt(pos).range;
            await editor.edit((editBuilder) => {
              editBuilder.delete(lineRange);
            });
          } else {
            await cmd("editor.action.deleteLines");
          }
          return true;
        }

        case Intent.DeleteSelection:
          await cmd("editor.action.deleteSelection");
          return true;

        case Intent.DuplicateLine:
          await cmd("editor.action.duplicateSelection");
          return true;

        case Intent.Copy:
          await cmd("editor.action.clipboardCopyAction");
          return true;

        case Intent.Cut:
          await cmd("editor.action.clipboardCutAction");
          return true;

        case Intent.Paste:
          await cmd("editor.action.clipboardPasteAction");
          return true;

        case Intent.SelectAll:
          await cmd("editor.action.selectAll");
          return true;

        case Intent.SelectLine: {
          if (editor) {
            const line = editor.selection.active.line;
            const lineRange = editor.document.lineAt(line).range;
            editor.selection = new vscode.Selection(lineRange.start, lineRange.end);
          }
          return true;
        }

        case Intent.NewLineBelow:
          await cmd("editor.action.insertLineAfter");
          return true;

        case Intent.NewLineAbove:
          await cmd("editor.action.insertLineBefore");
          return true;

        case Intent.Indent:
          await cmd("editor.action.indentLines");
          return true;

        case Intent.Outdent:
          await cmd("editor.action.outdentLines");
          return true;

        case Intent.ReplaceText: {
          const oldText = result.entities.old;
          const newText = result.entities.new;
          if (oldText && newText && editor) {
            const fullText = editor.document.getText();
            const replaced = fullText.split(oldText).join(newText);
            const allRange = new vscode.Range(
              editor.document.positionAt(0),
              editor.document.positionAt(fullText.length)
            );
            await editor.edit((editBuilder) => {
              editBuilder.replace(allRange, replaced);
            });
          }
          return true;
        }

        case Intent.FindInFile: {
          const term = result.entities.term;
          if (term) {
            await cmd("workbench.action.findInFiles", { query: term });
          }
          return true;
        }

        case Intent.Save:
          await cmd("workbench.action.files.save");
          return true;

        case Intent.CloseTab:
          await cmd("workbench.action.closeActiveEditor");
          return true;

        case Intent.NewFile:
          await cmd("workbench.action.files.newUntitledFile");
          return true;

        case Intent.OpenTerminal:
          await cmd("workbench.action.terminal.new");
          return true;

        case Intent.RunCommand: {
          const command = result.entities.command;
          const terminal = vscode.window.activeTerminal;
          if (terminal) {
            if (command === "test") {
              terminal.sendText("npm test");
            } else if (command === "build") {
              terminal.sendText("npm run build");
            }
          }
          return true;
        }

        case Intent.FormatDocument:
          await cmd("editor.action.formatDocument");
          return true;

        case Intent.InsertText: {
          const text = result.entities.text;
          if (text && editor) {
            await editor.edit((editBuilder) => {
              editBuilder.insert(editor.selection.active, text);
            });
          }
          return true;
        }

        case Intent.Unknown:
          return false;

        default:
          log(`Unhandled intent: ${result.intent}`);
          return false;
      }
    },
  };
}
