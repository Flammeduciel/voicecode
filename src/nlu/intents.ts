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
  MoveWordLeft = "move_word_left",
  MoveWordRight = "move_word_right",
  GoToFile = "go_to_file",
  GoToSymbol = "go_to_symbol",
  GoToDefinition = "go_to_definition",
  GoToReferences = "go_to_references",
  GoToImplementation = "go_to_implementation",
  PeekDefinition = "peek_definition",

  // Scrolling
  ScrollUp = "scroll_up",
  ScrollDown = "scroll_down",
  PageUp = "page_up",
  PageDown = "page_down",
  ScrollToTop = "scroll_to_top",
  ScrollToBottom = "scroll_to_bottom",

  // Editing
  Undo = "undo",
  Redo = "redo",
  DeleteLine = "delete_line",
  DeleteSelection = "delete_selection",
  DeleteWord = "delete_word",
  DeleteWordLeft = "delete_word_left",
  DeleteWordRight = "delete_word_right",
  DuplicateLine = "duplicate_line",
  MoveLineUp = "move_line_up",
  MoveLineDown = "move_line_down",
  JoinLines = "join_lines",
  SortLines = "sort_lines",
  Uppercase = "uppercase",
  Lowercase = "lowercase",
  TrimWhitespace = "trim_whitespace",
  Copy = "copy",
  Cut = "cut",
  Paste = "paste",
  SelectAll = "select_all",
  SelectLine = "select_line",
  SelectWord = "select_word",
  SelectToBracket = "select_to_bracket",
  NewLineBelow = "new_line_below",
  NewLineAbove = "new_line_above",
  Indent = "indent",
  Outdent = "outdent",

  // Multi-cursor
  AddCursorAbove = "add_cursor_above",
  AddCursorBelow = "add_cursor_below",
  SelectNextOccurrence = "select_next_occurrence",
  AddCursorToNextLine = "add_cursor_to_next_line",

  // Commenting
  ToggleComment = "toggle_comment",
  ToggleBlockComment = "toggle_block_comment",

  // Fold/Unfold
  Fold = "fold",
  Unfold = "unfold",
  FoldAll = "fold_all",
  UnfoldAll = "unfold_all",
  FoldLevel2 = "fold_level_2",
  FoldLevel3 = "fold_level_3",

  // Search & Replace
  ReplaceText = "replace_text",
  FindInFile = "find_in_file",
  FindNext = "find_next",
  FindPrevious = "find_previous",
  ReplaceNext = "replace_next",
  ReplaceAll = "replace_all",
  CloseSearch = "close_search",

  // Tab management
  NextTab = "next_tab",
  PreviousTab = "previous_tab",
  CloseTab = "close_tab",
  CloseAllTabs = "close_all_tabs",
  ReopenClosedTab = "reopen_closed_tab",
  PinTab = "pin_tab",

  // Editor management
  SplitEditor = "split_editor",
  CloseAllEditors = "close_all_editors",
  NextEditor = "next_editor",
  PreviousEditor = "previous_editor",

  // Files & Terminal
  Save = "save",
  SaveAll = "save_all",
  NewFile = "new_file",
  OpenTerminal = "open_terminal",
  ClearTerminal = "clear_terminal",
  FocusTerminal = "focus_terminal",
  KillTerminal = "kill_terminal",
  RunCommand = "run_command",

  // Formatting
  FormatDocument = "format_document",

  // Panels
  ToggleSidebar = "toggle_sidebar",
  TogglePanel = "toggle_panel",
  ToggleActivityBar = "toggle_activity_bar",
  ToggleTerminalPanel = "toggle_terminal_panel",

  // Zoom
  ZoomIn = "zoom_in",
  ZoomOut = "zoom_out",
  ResetZoom = "reset_zoom",

  // Git
  GitCommit = "git_commit",
  GitPush = "git_push",
  GitPull = "git_pull",
  GitStatus = "git_status",
  GitDiff = "git_diff",
  GitLog = "git_log",

  // Bookmarks
  ToggleBookmark = "toggle_bookmark",
  NextBookmark = "next_bookmark",
  PreviousBookmark = "previous_bookmark",
  ClearBookmarks = "clear_bookmarks",

  // Refactor
  RenameSymbol = "rename_symbol",
  QuickFix = "quick_fix",
  RefactorAction = "refactor_action",

  // Debug
  StartDebugging = "start_debugging",
  StopDebugging = "stop_debugging",
  StepOver = "step_over",
  StepInto = "step_into",
  StepOut = "step_out",
  ContinueDebugging = "continue_debugging",
  ToggleBreakpoint = "toggle_breakpoint",

  // Settings & UI
  OpenSettings = "open_settings",
  OpenExtensions = "open_extensions",
  ToggleExplorer = "toggle_explorer",
  OpenRecent = "open_recent",

  // Window
  NewWindow = "new_window",
  CloseWindow = "close_window",

  // Dictation
  DictateToggle = "dictate_toggle",
  InsertText = "insert_text",

  // Unknown
  Unknown = "unknown",
}
