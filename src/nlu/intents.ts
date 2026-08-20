export const enum Intent {
  // Navigation
  GoToLine = "go_to_line",
  GoToStart = "go_to_start",
  GoToEnd = "go_to_end",
  GoToLineStart = "go_to_line_start",
  GoToLineEnd = "go_to_line_end",
  MoveUp = "move_up",
  MoveDown = "move_down",
  MoveLeft = "move_left",
  MoveRight = "move_right",
  GoToFile = "go_to_file",
  GoToSymbol = "go_to_symbol",

  // Editing
  Undo = "undo",
  Redo = "redo",
  DeleteLine = "delete_line",
  DeleteSelection = "delete_selection",
  DuplicateLine = "duplicate_line",
  Copy = "copy",
  Cut = "cut",
  Paste = "paste",
  SelectAll = "select_all",
  SelectLine = "select_line",
  NewLineBelow = "new_line_below",
  NewLineAbove = "new_line_above",
  Indent = "indent",
  Outdent = "outdent",

  // Search & Replace
  ReplaceText = "replace_text",
  FindInFile = "find_in_file",

  // Files & Terminal
  Save = "save",
  CloseTab = "close_tab",
  NewFile = "new_file",
  OpenTerminal = "open_terminal",
  RunCommand = "run_command",

  // Formatting
  FormatDocument = "format_document",

  // Dictation
  InsertText = "insert_text",

  // Unknown
  Unknown = "unknown",
}

export interface NLUResult {
  intent: Intent;
  confidence: number;
  entities: Record<string, any>;
  rawText: string;
}

export const INTENT_DESCRIPTIONS: Record<Intent, string> = {
  [Intent.GoToLine]: "Navigate to a specific line number",
  [Intent.GoToStart]: "Navigate to the start of the document",
  [Intent.GoToEnd]: "Navigate to the end of the document",
  [Intent.GoToLineStart]: "Navigate to the start of the current line",
  [Intent.GoToLineEnd]: "Navigate to the end of the current line",
  [Intent.MoveUp]: "Move cursor up",
  [Intent.MoveDown]: "Move cursor down",
  [Intent.MoveLeft]: "Move cursor left",
  [Intent.MoveRight]: "Move cursor right",
  [Intent.GoToFile]: "Open a specific file",
  [Intent.GoToSymbol]: "Navigate to a function or symbol",
  [Intent.Undo]: "Undo last action",
  [Intent.Redo]: "Redo last action",
  [Intent.DeleteLine]: "Delete a specific line or current line",
  [Intent.DeleteSelection]: "Delete the current selection",
  [Intent.DuplicateLine]: "Duplicate the current line",
  [Intent.Copy]: "Copy selection to clipboard",
  [Intent.Cut]: "Cut selection to clipboard",
  [Intent.Paste]: "Paste from clipboard",
  [Intent.SelectAll]: "Select all text in editor",
  [Intent.SelectLine]: "Select the current line",
  [Intent.NewLineBelow]: "Insert a new line below",
  [Intent.NewLineAbove]: "Insert a new line above",
  [Intent.Indent]: "Indent the current line",
  [Intent.Outdent]: "Outdent the current line",
  [Intent.ReplaceText]: "Replace text with other text",
  [Intent.FindInFile]: "Search for text in the current file",
  [Intent.Save]: "Save the current file",
  [Intent.CloseTab]: "Close the current tab",
  [Intent.NewFile]: "Create a new untitled file",
  [Intent.OpenTerminal]: "Open a new terminal",
  [Intent.RunCommand]: "Run a command in the terminal",
  [Intent.FormatDocument]: "Format the current document",
  [Intent.InsertText]: "Insert dictated text",
  [Intent.Unknown]: "Unknown or unrecognized command",
};
