import { Intent, NLUResult } from "./intents";

interface PatternRule {
  patterns: RegExp[];
  intent: Intent;
  confidence: number;
  extract?: (match: RegExpMatchArray) => Record<string, any>;
}

const RULES: PatternRule[] = [
  // ── Quick single-word commands ──
  { patterns: [/^undo$/i], intent: Intent.Undo, confidence: 0.99 },
  { patterns: [/^redo$/i], intent: Intent.Redo, confidence: 0.99 },
  { patterns: [/^copy$/i], intent: Intent.Copy, confidence: 0.97 },
  { patterns: [/^cut$/i], intent: Intent.Cut, confidence: 0.97 },
  { patterns: [/^paste$/i], intent: Intent.Paste, confidence: 0.97 },
  { patterns: [/^save$/i], intent: Intent.Save, confidence: 0.98 },
  { patterns: [/^close$/i], intent: Intent.CloseTab, confidence: 0.95 },
  { patterns: [/^indent$/i, /^tab$/i], intent: Intent.Indent, confidence: 0.95 },
  { patterns: [/^outdent$/i, /^unindent$/i, /^shift\s*tab$/i], intent: Intent.Outdent, confidence: 0.95 },
  { patterns: [/^format$/i], intent: Intent.FormatDocument, confidence: 0.95 },
  { patterns: [/^(?:comment|toggle comment)$/i], intent: Intent.ToggleComment, confidence: 0.95 },
  { patterns: [/^(?:block comment)$/i], intent: Intent.ToggleBlockComment, confidence: 0.95 },
  { patterns: [/^(?:fold|plier)$/i], intent: Intent.Fold, confidence: 0.93 },
  { patterns: [/^(?:unfold|deplier)$/i], intent: Intent.Unfold, confidence: 0.93 },
  { patterns: [/^(?:fold all|plier tout)$/i], intent: Intent.FoldAll, confidence: 0.93 },
  { patterns: [/^(?:unfold all|deplier tout)$/i], intent: Intent.UnfoldAll, confidence: 0.93 },
  { patterns: [/^(?:save all|sauvegarde tout)$/i], intent: Intent.SaveAll, confidence: 0.96 },
  { patterns: [/^(?:close all|ferme tout)$/i], intent: Intent.CloseAllTabs, confidence: 0.94 },
  { patterns: [/^(?:close all editors|ferme tout les editeurs)$/i], intent: Intent.CloseAllEditors, confidence: 0.94 },
  { patterns: [/^(?:new window|nouvelle fenetre)$/i], intent: Intent.NewWindow, confidence: 0.94 },
  { patterns: [/^(?:close window|ferme la fenetre)$/i], intent: Intent.CloseWindow, confidence: 0.94 },
  { patterns: [/^(?:clear|efface|vide)$/i, /^(?:clear terminal|efface terminal|vide terminal)$/i], intent: Intent.ClearTerminal, confidence: 0.94 },

  // ── Terminal ──
  {
    patterns: [/^(?:open|show)\s+(?:the\s+)?(?:terminal|console)$/i, /^(?:ouvre|montre)\s+(?:le\s+)?(?:terminal|console)$/i],
    intent: Intent.OpenTerminal, confidence: 0.96,
  },
  {
    patterns: [/^(?:focus|go to)\s+(?:the\s+)?terminal$/i, /^(?:va|focus)\s+(?:au\s+)?terminal$/i],
    intent: Intent.FocusTerminal, confidence: 0.95,
  },
  {
    patterns: [/^(?:kill|close)\s+(?:the\s+)?terminal$/i, /^(?:tue|ferme)\s+(?:le\s+)?terminal$/i],
    intent: Intent.KillTerminal, confidence: 0.94,
  },
  {
    patterns: [/^(?:clear terminal|efface terminal|vide terminal)$/i],
    intent: Intent.ClearTerminal, confidence: 0.94,
  },
  {
    patterns: [/^(?:run|execute|launch)\s+(?:the\s+)?(?:tests?|test)$/i, /^(?:lance|execute)\s+(?:les\s+)?(?:tests?|test)$/i],
    intent: Intent.RunCommand, confidence: 0.95,
    extract: () => ({ command: "test" }),
  },
  {
    patterns: [/^(?:compile|build)$/i, /^(?:compile|construit)$/i],
    intent: Intent.RunCommand, confidence: 0.95,
    extract: () => ({ command: "build" }),
  },

  // ── File operations ──
  {
    patterns: [/^(?:new|create)\s+(?:file|document)$/i, /^(?:nouveau|cree)\s+(?:fichier|document)$/i],
    intent: Intent.NewFile, confidence: 0.96,
  },
  {
    patterns: [/^(?:close)\s+(?:the\s+)?(?:tab|editor|file)$/i, /^(?:ferme)\s+(?:l['']onglet|l['']editeur|le fichier)$/i],
    intent: Intent.CloseTab, confidence: 0.95,
  },
  {
    patterns: [/^(?:reopen|restore)\s+(?:closed|last)\s+(?:tab|editor)$/i, /^(?:reouvre|restaure)\s+(?:l['']onglet|l['']editeur)$/i],
    intent: Intent.ReopenClosedTab, confidence: 0.93,
  },
  {
    patterns: [/^(?:pin|epingle)\s+(?:tab|onglet)$/i],
    intent: Intent.PinTab, confidence: 0.93,
  },

  // ── Navigation ──
  {
    patterns: [
      /^(?:go\s+to\s+(?:the\s+)?line\s+)?(\d+)$/,
      /^(?:go\s+to\s+line\s+|jump\s+to\s+)?(\d+)$/,
      /^line\s+(\d+)$/i,
      /^(?:va\s+(?:a\s+|aux?\s+))?ligne\s+(\d+)$/i,
      /^(?:va\s+)?(\d+)$/i,
    ],
    intent: Intent.GoToLine, confidence: 0.98,
    extract: (m) => ({ line: parseInt(m[1]) }),
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:the\s+)?(?:start|top|beginning)$/i,
      /^(?:va\s+)?(?:au\s+)?(?:debut|debut|commencement)$/i,
    ],
    intent: Intent.GoToStart, confidence: 0.97,
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:the\s+)?(?:end|bottom)$/i,
      /^(?:va\s+)?(?:a\s+la\s+)?(?:fin|bas)$/i,
    ],
    intent: Intent.GoToEnd, confidence: 0.97,
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:start|beginning)\s+of\s+(?:the\s+)?(?:line)$/i,
      /^(?:va\s+)?(?:au\s+)?debut\s+(?:de\s+la\s+)?ligne$/i,
    ],
    intent: Intent.GoToLineStart, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:end)\s+of\s+(?:the\s+)?(?:line)$/i,
      /^(?:va\s+)?(?:a\s+la\s+)?fin\s+(?:de\s+la\s+)?ligne$/i,
    ],
    intent: Intent.GoToLineEnd, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:go\s+)?up(?:\s+(\d+))?$/i,
      /^(?:monte|va\s+en\s+haut)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveUp, confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [
      /^(?:go\s+)?down(?:\s+(\d+))?$/i,
      /^(?:descend|va\s+en\s+bas)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveDown, confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [
      /^(?:go\s+)?left(?:\s+(\d+))?$/i,
      /^(?:gauche|va\s+a\s+gauche)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveLeft, confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [
      /^(?:go\s+)?right(?:\s+(\d+))?$/i,
      /^(?:droite|va\s+a\s+droite)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveRight, confidence: 0.95,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  // Word movement
  {
    patterns: [
      /^(?:move\s+)?(?:word\s+)?left(?:\s+(\d+))?$/i,
      /^(?:va\s+)?(?:au\s+)?mot\s+(?:a\s+)?gauche$/i,
      /^(?:recule)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveWordLeft, confidence: 0.94,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },
  {
    patterns: [
      /^(?:move\s+)?(?:word\s+)?right(?:\s+(\d+))?$/i,
      /^(?:va\s+)?(?:au\s+)?mot\s+(?:a\s+)?droite$/i,
      /^(?:avance)(?:\s+(\d+))?$/i,
    ],
    intent: Intent.MoveWordRight, confidence: 0.94,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 1 }),
  },

  // ── Go to symbol/file/definition ──
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:function|method|symbol)\s+(.+)$/i,
      /^(?:va\s+)?(?:a\s+la\s+)?(?:fonction|methode|symbole)\s+(.+)$/i,
    ],
    intent: Intent.GoToSymbol, confidence: 0.90,
    extract: (m) => ({ symbol: m[1].trim() }),
  },
  {
    patterns: [
      /^(?:go\s+to\s+file|open)\s+(.+)$/i,
      /^(?:va\s+)?(?:au\s+fichier|ouvre)\s+(.+)$/i,
    ],
    intent: Intent.GoToFile, confidence: 0.90,
    extract: (m) => ({ file: m[1].trim() }),
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?(?:definition|def)\s*(.+)?$/i,
      /^(?:va\s+)?(?:a\s+la\s+)?definition\s*(.+)?$/i,
    ],
    intent: Intent.GoToDefinition, confidence: 0.92,
    extract: (m) => ({ symbol: m[1]?.trim() || "" }),
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?references?\s*(.+)?$/i,
      /^(?:va\s+)?(?:aux?\s+)?references?\s*(.+)?$/i,
    ],
    intent: Intent.GoToReferences, confidence: 0.92,
    extract: (m) => ({ symbol: m[1]?.trim() || "" }),
  },
  {
    patterns: [
      /^(?:go\s+to\s+)?implementation\s*(.+)?$/i,
      /^(?:va\s+)?(?:a\s+la\s+)?implementation\s*(.+)?$/i,
    ],
    intent: Intent.GoToImplementation, confidence: 0.92,
    extract: (m) => ({ symbol: m[1]?.trim() || "" }),
  },
  {
    patterns: [
      /^(?:peek|show)\s+(?:definition|def)\s*(.+)?$/i,
      /^(?:apercu|montre)\s+(?:la\s+)?definition\s*(.+)?$/i,
    ],
    intent: Intent.PeekDefinition, confidence: 0.90,
    extract: (m) => ({ symbol: m[1]?.trim() || "" }),
  },

  // ── Scrolling ──
  {
    patterns: [
      /^(?:scroll\s+)?up(?:\s+(\d+))?$/i,
      /^(?:defile|scroll)\s+(?:vers\s+)?haut(?:\s+(\d+))?$/i,
    ],
    intent: Intent.ScrollUp, confidence: 0.94,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 3 }),
  },
  {
    patterns: [
      /^(?:scroll\s+)?down(?:\s+(\d+))?$/i,
      /^(?:defile|scroll)\s+(?:vers\s+)?bas(?:\s+(\d+))?$/i,
    ],
    intent: Intent.ScrollDown, confidence: 0.94,
    extract: (m) => ({ count: m[1] ? parseInt(m[1]) : 3 }),
  },
  {
    patterns: [
      /^(?:page\s+)?up$/i,
      /^(?:page\s+)?haut$/i,
    ],
    intent: Intent.PageUp, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:page\s+)?down$/i,
      /^(?:page\s+)?bas$/i,
    ],
    intent: Intent.PageDown, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:scroll|go)\s+to\s+(?:the\s+)?(?:top|start|beginning)$/i,
      /^(?:va|defile)\s+(?:au\s+)?(?:debut|commencement)$/i,
    ],
    intent: Intent.ScrollToTop, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:scroll|go)\s+to\s+(?:the\s+)?(?:bottom|end)$/i,
      /^(?:va|defile)\s+(?:a\s+la\s+)?(?:fin|bas)$/i,
    ],
    intent: Intent.ScrollToBottom, confidence: 0.93,
  },

  // ── Editing ──
  {
    patterns: [/^undo(?:\s+that)?$/i, /^annule$/i],
    intent: Intent.Undo, confidence: 0.99,
  },
  {
    patterns: [/^redo(?:\s+that)?$/i, /^refais$/i],
    intent: Intent.Redo, confidence: 0.99,
  },
  {
    patterns: [
      /^(?:delete|remove)\s+(?:the\s+)?(?:line)\s*(\d+)?$/i,
      /^(?:supprime|efface)\s+(?:la\s+)?ligne\s*(\d+)?$/i,
    ],
    intent: Intent.DeleteLine, confidence: 0.96,
    extract: (m) => ({ line: m[1] ? parseInt(m[1]) : null }),
  },
  {
    patterns: [
      /^(?:delete|remove)\s+(?:the\s+)?(?:selection|that)$/i,
      /^(?:supprime|efface)\s+(?:la\s+)?selection$/i,
    ],
    intent: Intent.DeleteSelection, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:delete|remove)\s+(?:the\s+)?(?:word|next\s+word)$/i,
      /^(?:supprime|efface)\s+(?:le\s+)?mot$/i,
    ],
    intent: Intent.DeleteWord, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:delete\s+word\s+left|ctrl\s+backspace)$/i,
      /^(?:supprime\s+le\s+mot\s+(?:a\s+)?gauche|recule\s+et\s+supprime)$/i,
    ],
    intent: Intent.DeleteWordLeft, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:delete\s+word\s+right|ctrl\s+delete)$/i,
      /^(?:supprime\s+le\s+mot\s+(?:a\s+)?droite|avance\s+et\s+supprime)$/i,
    ],
    intent: Intent.DeleteWordRight, confidence: 0.94,
  },
  {
    patterns: [
      /^duplicate\s+(?:the\s+)?(?:line)$/i,
      /^duplique\s+(?:la\s+)?ligne$/i,
    ],
    intent: Intent.DuplicateLine, confidence: 0.97,
  },
  {
    patterns: [
      /^(?:move|deplace)\s+(?:the\s+)?line\s+(?:up|above)$/i,
      /^(?:deplace|remonter)\s+(?:la\s+)?ligne\s+(?:vers\s+)?haut$/i,
    ],
    intent: Intent.MoveLineUp, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:move|deplace)\s+(?:the\s+)?line\s+(?:down|below)$/i,
      /^(?:deplace|descend)\s+(?:la\s+)?ligne\s+(?:vers\s+)?bas$/i,
    ],
    intent: Intent.MoveLineDown, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:join|merge)\s+lines?$/i,
      /^(?:joindre|fusionner)\s+(?:les\s+)?lignes?$/i,
    ],
    intent: Intent.JoinLines, confidence: 0.94,
  },
  {
    patterns: [
      /^sort\s+lines?$/i,
      /^trier\s+(?:les\s+)?lignes?$/i,
    ],
    intent: Intent.SortLines, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:to\s+)?uppercase$/i,
      /^(?:majuscule|en\s+majuscule)$/i,
    ],
    intent: Intent.Uppercase, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:to\s+)?lowercase$/i,
      /^(?:minuscule|en\s+minuscule)$/i,
    ],
    intent: Intent.Lowercase, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:trim|remove)\s+(?:trailing\s+)?whitespace$/i,
      /^(?:supprime|enleve)\s+les\s+espaces$/i,
    ],
    intent: Intent.TrimWhitespace, confidence: 0.93,
  },
  {
    patterns: [/^(?:select)\s+(?:the\s+)?(?:all|everything)$/i, /^(?:select|selection(?:ne)?)\s+(?:tout|toute)$/i],
    intent: Intent.SelectAll, confidence: 0.98,
  },
  {
    patterns: [
      /^(?:select)\s+(?:the\s+)?(?:line)$/i,
      /^selectionne?\s+(?:la\s+)?ligne$/i,
    ],
    intent: Intent.SelectLine, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:select)\s+(?:the\s+)?(?:word|next\s+word)$/i,
      /^selectionne?\s+(?:le\s+)?mot$/i,
    ],
    intent: Intent.SelectWord, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:select\s+to|extend\s+to)\s+(?:the\s+)?bracket$/i,
      /^selectionne?\s+(?:jusqu['']au|au)\s+括号$/i,
    ],
    intent: Intent.SelectToBracket, confidence: 0.90,
  },
  {
    patterns: [
      /^(?:new\s+)?(?:line)\s+(?:below|under|after)$/i,
      /^(?:nouvelle\s+)?ligne\s+(?:dessous|en\s+dessous|apres)$/i,
    ],
    intent: Intent.NewLineBelow, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:new\s+)?(?:line)\s+(?:above|before)$/i,
      /^(?:nouvelle\s+)?ligne\s+(?:dessus|en\s+dessus|avant)$/i,
    ],
    intent: Intent.NewLineAbove, confidence: 0.95,
  },

  // ── Multi-cursor ──
  {
    patterns: [
      /^(?:add|insert)\s+cursor\s+(?:above|up)$/i,
      /^(?:ajoute|insere)\s+(?:un\s+)?curseur\s+(?:dessus|en\s+haut)$/i,
    ],
    intent: Intent.AddCursorAbove, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:add|insert)\s+cursor\s+(?:below|down)$/i,
      /^(?:ajoute|insere)\s+(?:un\s+)?curseur\s+(?:dessous|en\s+bas)$/i,
    ],
    intent: Intent.AddCursorBelow, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:select|add)\s+(?:next\s+)?occurrence$/i,
      /^(?:selectionne|ajoute)\s+(?:l['']occurrence\s+)?suivante$/i,
    ],
    intent: Intent.SelectNextOccurrence, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:add|insert)\s+cursor\s+to\s+(?:next|each)\s+line$/i,
      /^(?:ajoute|insere)\s+(?:un\s+)?curseur\s+(?:a\s+chaque|aux?\s+)?lignes?$/i,
    ],
    intent: Intent.AddCursorToNextLine, confidence: 0.93,
  },

  // ── Commenting ──
  {
    patterns: [
      /^(?:toggle|add|remove)\s+(?:line\s+)?comment$/i,
      /^(?:commente?|decommente?)\s+(?:la\s+)?ligne$/i,
    ],
    intent: Intent.ToggleComment, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:toggle|add|remove)\s+block\s+comment$/i,
      /^(?:commente?|decommente?)\s+en\s+bloc$/i,
    ],
    intent: Intent.ToggleBlockComment, confidence: 0.93,
  },

  // ── Fold/Unfold ──
  {
    patterns: [
      /^(?:fold|collapse)\s+(?:all|everything)$/i,
      /^(?:plie|replie)\s+(?:tout|tout le code)$/i,
    ],
    intent: Intent.FoldAll, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:unfold|expand)\s+(?:all|everything)$/i,
      /^(?:deplie|etale)\s+(?:tout|tout le code)$/i,
    ],
    intent: Intent.UnfoldAll, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:fold|collapse)\s+(?:level\s+)?2$/i,
      /^(?:plie)\s+(?:niveau\s+)?2$/i,
    ],
    intent: Intent.FoldLevel2, confidence: 0.92,
  },
  {
    patterns: [
      /^(?:fold|collapse)\s+(?:level\s+)?3$/i,
      /^(?:plie)\s+(?:niveau\s+)?3$/i,
    ],
    intent: Intent.FoldLevel3, confidence: 0.92,
  },

  // ── Search & Replace ──
  {
    patterns: [
      /^(?:replace)\s+(.+?)\s+(?:with|by)\s+(.+)$/i,
      /^(?:remplace)\s+(.+?)\s+(?:par|avec)\s+(.+)$/i,
    ],
    intent: Intent.ReplaceText, confidence: 0.90,
    extract: (m) => ({ old: m[1].trim(), new: m[2].trim() }),
  },
  {
    patterns: [
      /^(?:find|search)\s+(.+)$/i,
      /^(?:cherche|recherche)\s+(.+)$/i,
    ],
    intent: Intent.FindInFile, confidence: 0.90,
    extract: (m) => ({ term: m[1].trim() }),
  },
  {
    patterns: [
      /^(?:find|search)\s+next$/i,
      /^(?:cherche|recherche)\s+(?:la\s+)?suivant$/i,
    ],
    intent: Intent.FindNext, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:find|search)\s+(?:previous|previous)$/i,
      /^(?:cherche|recherche)\s+(?:la\s+)?precedent$/i,
    ],
    intent: Intent.FindPrevious, confidence: 0.93,
  },
  {
    patterns: [
      /^replace\s+next$/i,
      /^remplace\s+(?:le\s+)?suivant$/i,
    ],
    intent: Intent.ReplaceNext, confidence: 0.93,
  },
  {
    patterns: [
      /^replace\s+all$/i,
      /^remplace\s+(?:tout|tous)$/i,
    ],
    intent: Intent.ReplaceAll, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:close|escape)\s+(?:search|find)$/i,
      /^(?:ferme|annule)\s+(?:la\s+)?recherche$/i,
    ],
    intent: Intent.CloseSearch, confidence: 0.93,
  },

  // ── Formatting ──
  {
    patterns: [
      /^(?:format)\s*(?:the\s+)?(?:document|file|selection)?$/i,
      /^(?:formate)\s*(?:le\s+)?(?:document|fichier|selection)?$/i,
    ],
    intent: Intent.FormatDocument, confidence: 0.95,
  },

  // ── Tab management ──
  {
    patterns: [
      /^(?:next|switch\s+to)\s+tab$/i,
      /^(?:onglet|prochain)\s+suivant$/i,
      /^suivant$/i,
    ],
    intent: Intent.NextTab, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:previous|switch\s+to)\s+tab$/i,
      /^(?:onglet|precedent)\s+precedent$/i,
      /^precedent$/i,
    ],
    intent: Intent.PreviousTab, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:close|close\s+all)\s+tabs?$/i,
      /^(?:ferme|ferme\s+tout)\s+(?:l['']onglet|les\s+onglets?)$/i,
    ],
    intent: Intent.CloseAllTabs, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:reopen|restore)\s+(?:closed|last)\s+tab$/i,
      /^(?:reouvre|restaure)\s+(?:l['']onglet)$/i,
    ],
    intent: Intent.ReopenClosedTab, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:pin|toggle\s+pin)\s+tab$/i,
      /^(?:epingle|epingler)\s+(?:l['']onglet|onglet)$/i,
    ],
    intent: Intent.PinTab, confidence: 0.93,
  },

  // ── Editor management ──
  {
    patterns: [
      /^(?:split|split\s+editor)$/i,
      /^(?:divise|split)\s+(?:l['']editeur|editeur)$/i,
    ],
    intent: Intent.SplitEditor, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:next|switch\s+to)\s+editor$/i,
      /^(?:editeur|suivant)\s+suivant$/i,
    ],
    intent: Intent.NextEditor, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:previous|switch\s+to)\s+editor$/i,
      /^(?:editeur|precedent)\s+precedent$/i,
    ],
    intent: Intent.PreviousEditor, confidence: 0.94,
  },

  // ── Panels ──
  {
    patterns: [
      /^(?:toggle|show|hide)\s+(?:the\s+)?sidebar$/i,
      /^(?:montre|cache|affiche)\s+(?:la\s+)?barre\s+laterale$/i,
    ],
    intent: Intent.ToggleSidebar, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:toggle|show|hide)\s+(?:the\s+)?panel$/i,
      /^(?:montre|cache|affiche)\s+(?:le\s+)?panneau$/i,
    ],
    intent: Intent.TogglePanel, confidence: 0.95,
  },
  {
    patterns: [
      /^(?:toggle|show|hide)\s+(?:the\s+)?(?:activity\s+)?bar$/i,
      /^(?:montre|cache|affiche)\s+(?:la\s+)?barre\s+(?:d['']activite|laterale)$/i,
    ],
    intent: Intent.ToggleActivityBar, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:toggle|show|hide)\s+(?:the\s+)?terminal\s+panel$/i,
      /^(?:montre|cache|affiche)\s+(?:le\s+)?panneau\s+terminal$/i,
    ],
    intent: Intent.ToggleTerminalPanel, confidence: 0.94,
  },

  // ── Zoom ──
  {
    patterns: [
      /^(?:zoom\s+in|bigger|increase\s+font)$/i,
      /^(?:zoom|agrandit|zoomer)$/i,
    ],
    intent: Intent.ZoomIn, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:zoom\s+out|smaller|decrease\s+font)$/i,
      /^(?:dezoom|reduit|dezoomer)$/i,
    ],
    intent: Intent.ZoomOut, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:reset|default)\s+zoom$/i,
      /^(?:reinitialise|reset)\s+zoom$/i,
    ],
    intent: Intent.ResetZoom, confidence: 0.94,
  },

  // ── Git ──
  {
    patterns: [
      /^(?:git\s+)?commit$/i,
      /^(?:git\s+)?committe$/i,
    ],
    intent: Intent.GitCommit, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:git\s+)?push$/i,
      /^(?:git\s+)?pousse$/i,
    ],
    intent: Intent.GitPush, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:git\s+)?pull$/i,
      /^(?:git\s+)?tire$/i,
    ],
    intent: Intent.GitPull, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:git\s+)?status$/i,
      /^(?:git\s+)?statut$/i,
    ],
    intent: Intent.GitStatus, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:git\s+)?diff$/i,
    ],
    intent: Intent.GitDiff, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:git\s+)?log$/i,
      /^(?:git\s+)?journal$/i,
    ],
    intent: Intent.GitLog, confidence: 0.93,
  },

  // ── Bookmarks ──
  {
    patterns: [
      /^(?:toggle|add|remove)\s+(?:a\s+)?bookmark$/i,
      /^(?:ajoute|enleve|toggle)\s+(?:un\s+)?(?:signet|marqueur)$/i,
    ],
    intent: Intent.ToggleBookmark, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:next|go\s+to)\s+bookmark$/i,
      /^(?:va\s+)?(?:au\s+)?(?:signet|marqueur)\s+suivant$/i,
    ],
    intent: Intent.NextBookmark, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:previous|go\s+to)\s+bookmark$/i,
      /^(?:va\s+)?(?:au\s+)?(?:signet|marqueur)\s+precedent$/i,
    ],
    intent: Intent.PreviousBookmark, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:clear|remove)\s+(?:all\s+)?bookmarks$/i,
      /^(?:supprime|enleve)\s+(?:tous\s+les\s+)?(?:signets|marqueurs)$/i,
    ],
    intent: Intent.ClearBookmarks, confidence: 0.93,
  },

  // ── Refactor ──
  {
    patterns: [
      /^(?:rename|change\s+name)\s+(?:symbol|function|variable|class)\s*(.+)?$/i,
      /^(?:renomme|change\s+le\s+nom)\s+(?:le\s+)?(?:symbole|fonction|variable|classe)\s*(.+)?$/i,
    ],
    intent: Intent.RenameSymbol, confidence: 0.92,
    extract: (m) => ({ symbol: m[1]?.trim() || "" }),
  },
  {
    patterns: [
      /^(?:quick|show)\s+fix$/i,
      /^(?:correction|corrige|solution)/i,
    ],
    intent: Intent.QuickFix, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:refactor|refactorize)$/i,
      /^(?:refactorise)/i,
    ],
    intent: Intent.RefactorAction, confidence: 0.92,
  },

  // ── Debug ──
  {
    patterns: [
      /^(?:start|run|launch)\s+(?:debugging|debug)$/i,
      /^(?:demarre|lance)\s+(?:le\s+)?(?:debug|debogage)$/i,
    ],
    intent: Intent.StartDebugging, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:stop|terminate)\s+(?:debugging|debug)$/i,
      /^(?:arrete|termine)\s+(?:le\s+)?(?:debug|debogage)$/i,
    ],
    intent: Intent.StopDebugging, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:step|skip)\s+over$/i,
      /^(?:palier|passe)\s+dessus$/i,
    ],
    intent: Intent.StepOver, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:step|go)\s+(?:into|in)$/i,
      /^(?:palier|rentre)\s+(?:dedans|dessous)$/i,
    ],
    intent: Intent.StepInto, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:step|go)\s+out$/i,
      /^(?:palier|sort)\s+(?:dehors|sortir)$/i,
    ],
    intent: Intent.StepOut, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:continue|resume|play)$/i,
      /^(?:continue|reprend)$/i,
    ],
    intent: Intent.ContinueDebugging, confidence: 0.93,
  },
  {
    patterns: [
      /^(?:toggle|add|remove)\s+(?:a\s+)?(?:breakpoint|break\s+point)$/i,
      /^(?:ajoute|enleve|toggle)\s+(?:un\s+)?(?:point\s+d['']arret|breakpoint)$/i,
    ],
    intent: Intent.ToggleBreakpoint, confidence: 0.93,
  },

  // ── Settings & UI ──
  {
    patterns: [
      /^(?:open|show)\s+(?:settings|preferences|options)$/i,
      /^(?:ouvre|montre|affiche)\s+(?:les\s+)?(?:parametres|preferences|options)$/i,
    ],
    intent: Intent.OpenSettings, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:open|show)\s+extensions?$/i,
      /^(?:ouvre|montre|affiche)\s+(?:les\s+)?extensions?$/i,
    ],
    intent: Intent.OpenExtensions, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:toggle|show|hide)\s+(?:the\s+)?(?:file\s+)?explorer$/i,
      /^(?:montre|cache|affiche)\s+(?:l[''])?explorateur$/i,
    ],
    intent: Intent.ToggleExplorer, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:open|show)\s+recent(?:\s+files?)?$/i,
      /^(?:ouvre|montre)\s+(?:les\s+)?(?:fichiers?\s+)?recents?$/i,
    ],
    intent: Intent.OpenRecent, confidence: 0.93,
  },

  // ── Window ──
  {
    patterns: [
      /^(?:new|create)\s+window$/i,
      /^(?:nouvelle|cree)\s+fenetre$/i,
    ],
    intent: Intent.NewWindow, confidence: 0.94,
  },
  {
    patterns: [
      /^(?:close)\s+window$/i,
      /^(?:ferme)\s+la\s+fenetre$/i,
    ],
    intent: Intent.CloseWindow, confidence: 0.94,
  },
];

export function matchPatterns(text: string): NLUResult | null {
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        const entities = rule.extract ? rule.extract(match) : {};
        return {
          intent: rule.intent,
          confidence: rule.confidence,
          entities,
          rawText: text,
        };
      }
    }
  }
  return null;
}
