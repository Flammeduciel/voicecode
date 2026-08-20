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
        // ── Navigation ──
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
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorUp");
          return true;
        }
        case Intent.MoveDown: {
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorDown");
          return true;
        }
        case Intent.MoveLeft: {
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorLeft");
          return true;
        }
        case Intent.MoveRight: {
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorRight");
          return true;
        }
        case Intent.MoveWordLeft: {
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorWordLeft");
          return true;
        }
        case Intent.MoveWordRight: {
          const count = result.entities.count ?? 1;
          for (let i = 0; i < count; i++) await cmd("cursorWordRight");
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
        case Intent.GoToDefinition:
          await cmd("editor.action.revealDefinition");
          return true;
        case Intent.GoToReferences:
          await cmd("editor.action.findReferences");
          return true;
        case Intent.GoToImplementation:
          await cmd("editor.action.goToLocations");
          return true;
        case Intent.PeekDefinition:
          await cmd("editor.action.peekDefinition");
          return true;

        // ── Scrolling ──
        case Intent.ScrollUp: {
          const count = result.entities.count ?? 3;
          for (let i = 0; i < count; i++) await cmd("scrollLineUp");
          return true;
        }
        case Intent.ScrollDown: {
          const count = result.entities.count ?? 3;
          for (let i = 0; i < count; i++) await cmd("scrollLineDown");
          return true;
        }
        case Intent.PageUp:
          await cmd("scrollPageUp");
          return true;
        case Intent.PageDown:
          await cmd("scrollPageDown");
          return true;
        case Intent.ScrollToTop:
          await cmd("cursorTop");
          return true;
        case Intent.ScrollToBottom:
          await cmd("cursorBottom");
          return true;

        // ── Editing ──
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
        case Intent.DeleteWord:
          await cmd("deleteWordRight");
          return true;
        case Intent.DeleteWordLeft:
          await cmd("deleteWordLeft");
          return true;
        case Intent.DeleteWordRight:
          await cmd("deleteWordRight");
          return true;

        case Intent.DuplicateLine:
          await cmd("editor.action.duplicateSelection");
          return true;
        case Intent.MoveLineUp:
          await cmd("editor.action.moveLinesUpAction");
          return true;
        case Intent.MoveLineDown:
          await cmd("editor.action.moveLinesDownAction");
          return true;
        case Intent.JoinLines:
          await cmd("editor.action.joinLines");
          return true;
        case Intent.SortLines:
          await cmd("editor.action.sortLinesAscending");
          return true;
        case Intent.Uppercase:
          await cmd("editor.action.transformToUppercase");
          return true;
        case Intent.Lowercase:
          await cmd("editor.action.transformToLowercase");
          return true;
        case Intent.TrimWhitespace:
          await cmd("editor.action.trimTrailingWhitespace");
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
        case Intent.SelectWord:
          await cmd("editor.action.smartSelect.expand");
          return true;
        case Intent.SelectToBracket:
          await cmd("editor.action.smartSelect.expand");
          return true;

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

        // ── Multi-cursor ──
        case Intent.AddCursorAbove:
          await cmd("editor.action.insertCursorAbove");
          return true;
        case Intent.AddCursorBelow:
          await cmd("editor.action.insertCursorBelow");
          return true;
        case Intent.SelectNextOccurrence:
          await cmd("editor.action.addSelectionToNextFindMatch");
          return true;
        case Intent.AddCursorToNextLine:
          await cmd("editor.action.insertCursorAtEndOfEachLineSelected");
          return true;

        // ── Commenting ──
        case Intent.ToggleComment:
          await cmd("editor.action.commentLine");
          return true;
        case Intent.ToggleBlockComment:
          await cmd("editor.action.blockComment");
          return true;

        // ── Fold/Unfold ──
        case Intent.Fold:
          await cmd("editor.fold");
          return true;
        case Intent.Unfold:
          await cmd("editor.unfold");
          return true;
        case Intent.FoldAll:
          await cmd("editor.foldAll");
          return true;
        case Intent.UnfoldAll:
          await cmd("editor.unfoldAll");
          return true;
        case Intent.FoldLevel2:
          await cmd("editor.foldLevel2");
          return true;
        case Intent.FoldLevel3:
          await cmd("editor.foldLevel3");
          return true;

        // ── Search & Replace ──
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
        case Intent.FindNext:
          await cmd("editor.action.nextMatchFindAction");
          return true;
        case Intent.FindPrevious:
          await cmd("editor.action.previousMatchFindAction");
          return true;
        case Intent.ReplaceNext:
          await cmd("editor.action.nextMatchFindAction");
          await cmd("editor.action.replaceOne");
          return true;
        case Intent.ReplaceAll:
          await cmd("editor.action.replaceAll");
          return true;
        case Intent.CloseSearch:
          await cmd("closeFindWidget");
          return true;

        // ── Tab management ──
        case Intent.NextTab:
          await cmd("workbench.action.nextEditor");
          return true;
        case Intent.PreviousTab:
          await cmd("workbench.action.previousEditor");
          return true;
        case Intent.CloseTab:
          await cmd("workbench.action.closeActiveEditor");
          return true;
        case Intent.CloseAllTabs:
          await cmd("workbench.action.closeAllEditors");
          return true;
        case Intent.ReopenClosedTab:
          await cmd("workbench.action.reopenClosedEditor");
          return true;
        case Intent.PinTab:
          await cmd("workbench.action.keepEditor");
          return true;

        // ── Editor management ──
        case Intent.SplitEditor:
          await cmd("workbench.action.splitEditor");
          return true;
        case Intent.CloseAllEditors:
          await cmd("workbench.action.closeAllEditors");
          return true;
        case Intent.NextEditor:
          await cmd("workbench.action.nextEditor");
          return true;
        case Intent.PreviousEditor:
          await cmd("workbench.action.previousEditor");
          return true;

        // ── Files & Terminal ──
        case Intent.Save:
          await cmd("workbench.action.files.save");
          return true;
        case Intent.SaveAll:
          await cmd("workbench.action.files.saveAll");
          return true;
        case Intent.NewFile:
          await cmd("workbench.action.files.newUntitledFile");
          return true;
        case Intent.OpenTerminal:
          await cmd("workbench.action.terminal.new");
          return true;
        case Intent.ClearTerminal:
          await cmd("workbench.action.terminal.clear");
          return true;
        case Intent.FocusTerminal:
          await cmd("workbench.action.terminal.focus");
          return true;
        case Intent.KillTerminal:
          await cmd("workbench.action.terminal.kill");
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

        // ── Formatting ──
        case Intent.FormatDocument:
          await cmd("editor.action.formatDocument");
          return true;

        // ── Panels ──
        case Intent.ToggleSidebar:
          await cmd("workbench.action.toggleSidebarVisibility");
          return true;
        case Intent.TogglePanel:
          await cmd("workbench.action.togglePanel");
          return true;
        case Intent.ToggleActivityBar:
          await cmd("workbench.action.toggleActivityBarVisibility");
          return true;
        case Intent.ToggleTerminalPanel:
          await cmd("workbench.action.terminal.toggleTerminal");
          return true;

        // ── Zoom ──
        case Intent.ZoomIn:
          await cmd("editor.action.zoomIn");
          return true;
        case Intent.ZoomOut:
          await cmd("editor.action.zoomOut");
          return true;
        case Intent.ResetZoom:
          await cmd("editor.action.resetZoom");
          return true;

        // ── Git ──
        case Intent.GitCommit:
          await cmd("git.commit");
          return true;
        case Intent.GitPush:
          await cmd("git.push");
          return true;
        case Intent.GitPull:
          await cmd("git.pull");
          return true;
        case Intent.GitStatus:
          await cmd("git.refresh");
          return true;
        case Intent.GitDiff:
          await cmd("git.diff");
          return true;
        case Intent.GitLog:
          await cmd("git.viewHistory");
          return true;

        // ── Bookmarks ──
        case Intent.ToggleBookmark:
          await cmd("bookmarks.toggle");
          return true;
        case Intent.NextBookmark:
          await cmd("bookmarks.jumpToNext");
          return true;
        case Intent.PreviousBookmark:
          await cmd("bookmarks.jumpToPrevious");
          return true;
        case Intent.ClearBookmarks:
          await cmd("bookmarks.clear");
          return true;

        // ── Refactor ──
        case Intent.RenameSymbol:
          await cmd("editor.action.rename");
          return true;
        case Intent.QuickFix:
          await cmd("editor.action.quickFix");
          return true;
        case Intent.RefactorAction:
          await cmd("editor.action.refactor");
          return true;

        // ── Debug ──
        case Intent.StartDebugging:
          await cmd("debug.action.start");
          return true;
        case Intent.StopDebugging:
          await cmd("workbench.action.debug.stop");
          return true;
        case Intent.StepOver:
          await cmd("workbench.action.debug.stepOver");
          return true;
        case Intent.StepInto:
          await cmd("workbench.action.debug.stepInto");
          return true;
        case Intent.StepOut:
          await cmd("workbench.action.debug.stepOut");
          return true;
        case Intent.ContinueDebugging:
          await cmd("workbench.action.debug.continue");
          return true;
        case Intent.ToggleBreakpoint:
          await cmd("editor.debug.action.toggleBreakpoint");
          return true;

        // ── Settings & UI ──
        case Intent.OpenSettings:
          await cmd("workbench.action.openSettings");
          return true;
        case Intent.OpenExtensions:
          await cmd("workbench.extensions.action.showExtensions");
          return true;
        case Intent.ToggleExplorer:
          await cmd("workbench.view.explorer");
          return true;
        case Intent.OpenRecent:
          await cmd("workbench.action.openRecent");
          return true;

        // ── Window ──
        case Intent.NewWindow:
          await cmd("workbench.action.newWindow");
          return true;
        case Intent.CloseWindow:
          await cmd("workbench.action.closeWindow");
          return true;

        // ── Dictation ──
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
