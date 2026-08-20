<div align="center">

# VoiceCode

### Code with your voice. 80+ commands. French & English.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.95+-007ACC.svg)](https://code.visualstudio.com/)
[![Tests](https://img.shields.io/badge/tests-49%20passing-brightgreen)]()
[![Platform](https://img.shields.io/badge/platform-Windows-blue)]()

</div>

---

## What is VoiceCode?

VoiceCode is a **VS Code extension** that lets you write code entirely by voice. Speak your commands in **French or English**, and VoiceCode understands and executes them instantly.

- **80+ voice commands** — navigation, editing, git, debug, bookmarks, and more
- **Bilingual** — speak French or English, VoiceCode understands both
- **Instant execution** — commands apply immediately when recognized
- **Fuzzy matching** — handles plurals, typos, and close variations

Speech recognition runs in **Chrome** via the Web Speech API, giving you Google-quality transcription for free.

---

## How it Works

```
You speak → Chrome recognizes → WebSocket → NLU interprets → VS Code executes
```

1. **Press `Ctrl+Shift+V`** to start listening
2. **Chrome opens** with a speech recognition page
3. **Speak a command** like `"supprime la ligne 15"` or `"undo"`
4. **VoiceCode executes it** in your editor instantly

| Component | Technology |
|-----------|-----------|
| Speech Recognition | Chrome Web Speech API (Google) |
| Communication | WebSocket (localhost) |
| NLU | Regex patterns + Levenshtein fuzzy matching |
| Execution | VS Code Editor API |

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Run in VS Code

1. Open this project in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new VS Code window, press `Ctrl+Shift+V` to start recording
4. Chrome opens automatically — keep the tab open
5. Speak your commands!

---

## Voice Commands (80+)

### Navigation

| French | English | Action |
|--------|---------|--------|
| `"va à la ligne 15"` | `"go to line 15"` | Jump to line 15 |
| `"va au début"` | `"go to start"` | Jump to start of file |
| `"va à la fin"` | `"go to end"` | Jump to end of file |
| `"monte"` / `"descend"` | `"up"` / `"down"` | Move cursor up/down |
| `"gauche"` / `"droite"` | `"left"` / `"right"` | Move cursor left/right |
| `"va au mot gauche"` | `"move word left"` | Move one word left |
| `"va au mot droite"` | `"move word right"` | Move one word right |
| `"va à la définition"` | `"go to definition"` | Go to symbol definition |
| `"va aux références"` | `"go to references"` | Find all references |

### Scrolling

| French | English | Action |
|--------|---------|--------|
| `"défile haut"` / `"défile bas"` | `"scroll up"` / `"scroll down"` | Scroll lines |
| `"page haut"` / `"page bas"` | `"page up"` / `"page down"` | Scroll pages |
| `"va au début"` / `"va à la fin"` | `"scroll to top"` / `"scroll to bottom"` | Jump to top/bottom |

### Editing

| French | English | Action |
|--------|---------|--------|
| `"annule"` | `"undo"` | Undo last action |
| `"refais"` | `"redo"` | Redo last action |
| `"supprime la ligne"` | `"delete line"` | Delete current line |
| `"supprime le mot"` | `"delete word"` | Delete next word |
| `"duplique la ligne"` | `"duplicate line"` | Duplicate current line |
| `"déplace ligne haut"` / `"bas"` | `"move line up"` / `"down"` | Move line up/down |
| `"joindre lignes"` | `"join lines"` | Join with next line |
| `"trier lignes"` | `"sort lines"` | Sort selected lines |
| `"majuscule"` / `"minuscule"` | `"uppercase"` / `"lowercase"` | Transform text case |
| `"copie"` / `"colle"` / `"coupe"` | `"copy"` / `"paste"` / `"cut"` | Clipboard actions |
| `"indente"` / `"déindente"` | `"indent"` / `"outdent"` | Indent/outdent |

### Selection & Multi-Cursor

| French | English | Action |
|--------|---------|--------|
| `"sélectionne tout"` | `"select all"` | Select all text |
| `"sélectionne la ligne"` | `"select line"` | Select current line |
| `"sélectionne le mot"` | `"select word"` | Select word |
| `"ajoute curseur dessus"` | `"add cursor above"` | Add cursor above |
| `"ajoute curseur dessous"` | `"add cursor below"` | Add cursor below |
| `"sélectionne suivante"` | `"select next occurrence"` | Select next match |
| `"nouvelle ligne dessous"` | `"line below"` | Insert line below |
| `"nouvelle ligne dessus"` | `"line above"` | Insert line above |

### Comment & Fold

| French | English | Action |
|--------|---------|--------|
| `"commente la ligne"` | `"toggle comment"` | Comment/uncomment line |
| `"commente en bloc"` | `"block comment"` | Block comment |
| `"plie"` / `"déplie"` | `"fold"` / `"unfold"` | Fold/unfold code |
| `"plie tout"` / `"déplie tout"` | `"fold all"` / `"unfold all"` | Fold/unfold everything |
| `"plie niveau 2"` | `"fold level 2"` | Fold to level 2 |

### Search & Replace

| French | English | Action |
|--------|---------|--------|
| `"cherche HelloWorld"` | `"find HelloWorld"` | Search in file |
| `"remplace foo par bar"` | `"replace foo with bar"` | Find and replace |
| `"cherche suivant"` | `"find next"` | Next search result |
| `"remplace tout"` | `"replace all"` | Replace all matches |
| `"ferme la recherche"` | `"close search"` | Close search widget |

### Tabs & Editors

| French | English | Action |
|--------|---------|--------|
| `"suivant"` / `"précédent"` | `"next tab"` / `"previous tab"` | Switch tabs |
| `"ferme tout"` | `"close all tabs"` | Close all tabs |
| `"rouvre l'onglet"` | `"reopen tab"` | Reopen closed tab |
| `"épingle onglet"` | `"pin tab"` | Pin/unpin tab |
| `"divise l'éditeur"` | `"split editor"` | Split editor |
| `"éditeur suivant"` | `"next editor"` | Next editor group |

### Files & Terminal

| French | English | Action |
|--------|---------|--------|
| `"sauvegarde"` / `"sauve tout"` | `"save"` / `"save all"` | Save file(s) |
| `"nouveau fichier"` | `"new file"` | Create new file |
| `"ferme l'onglet"` | `"close tab"` | Close current tab |
| `"ouvre le terminal"` | `"open terminal"` | Open terminal |
| `"efface terminal"` | `"clear terminal"` | Clear terminal |
| `"focus terminal"` | `"focus terminal"` | Focus terminal |
| `"lance les tests"` | `"run tests"` | Run test command |
| `"compile"` | `"build"` | Run build command |
| `"formate"` | `"format"` | Format document |

### UI & Panels

| French | English | Action |
|--------|---------|--------|
| `"montre barre latérale"` | `"toggle sidebar"` | Show/hide sidebar |
| `"montre le panneau"` | `"toggle panel"` | Show/hide panel |
| `"explorateur"` | `"toggle explorer"` | Toggle file explorer |
| `"zoom"` / `"dézoom"` | `"zoom in"` / `"zoom out"` | Zoom in/out |
| `"paramètres"` | `"open settings"` | Open settings |
| `"extensions"` | `"open extensions"` | Open extensions |
| `"nouvelle fenêtre"` | `"new window"` | Open new window |

### Git

| French | English | Action |
|--------|---------|--------|
| `"git commit"` | `"git commit"` | Commit changes |
| `"git push"` | `"git push"` | Push to remote |
| `"git pull"` | `"git pull"` | Pull from remote |
| `"git statut"` | `"git status"` | Show git status |
| `"git diff"` | `"git diff"` | Show diff |
| `"git journal"` | `"git log"` | Show git log |

### Debug

| French | English | Action |
|--------|---------|--------|
| `"démarre le debug"` | `"start debugging"` | Start debugging |
| `"arrête le debug"` | `"stop debugging"` | Stop debugging |
| `"palier dessus"` | `"step over"` | Step over |
| `"palier dessous"` | `"step into"` | Step into |
| `"palier sortir"` | `"step out"` | Step out |
| `"continue"` | `"continue"` | Continue execution |
| `"ajoute breakpoint"` | `"toggle breakpoint"` | Toggle breakpoint |

### Refactor & Navigation

| French | English | Action |
|--------|---------|--------|
| `"renomme le symbole"` | `"rename symbol"` | Rename symbol |
| `"correction rapide"` | `"quick fix"` | Show quick fixes |
| `"refactorise"` | `"refactor"` | Refactor action |
| `"aperçu définition"` | `"peek definition"` | Peek at definition |

### Bookmarks

| French | English | Action |
|--------|---------|--------|
| `"ajoute signet"` | `"toggle bookmark"` | Toggle bookmark |
| `"signet suivant"` | `"next bookmark"` | Next bookmark |
| `"signet précédent"` | `"previous bookmark"` | Previous bookmark |

### Dictation Mode

Say **"dicte"** / **"dictate"** to enter dictation mode. Everything you say is inserted as text in the editor. Say **"arrete la dictee"** / **"stop dictation"** to exit.

| Say | Get |
|-----|-----|
| `"dicte"` / `"dictate"` | Enter dictation mode |
| `"arrete la dictee"` / `"stop dictation"` | Exit dictation mode |
| `"console.log parenthese ouvrante hello parenthese fermante"` | `console.log(hello)` |
| `"let x equals semicolon"` | `let x equals;` |

Punctuation words are automatically converted to characters:

| Say | Get |
|-----|-----|
| `"point"` / `"period"` | `.` |
| `"virgule"` / `"comma"` | `,` |
| `"point virgule"` / `"semicolon"` | `;` |
| `"deux points"` / `"colon"` | `:` |
| `"parenthese ouvrante"` / `"open paren"` | `(` |
| `"parenthese fermante"` / `"close paren"` | `)` |
| `"accolade ouvrante"` / `"open brace"` | `{` |
| `"accolade fermante"` / `"close brace"` | `}` |
| `"nouvelle ligne"` / `"new line"` | newline |

### Fuzzy Matching

VoiceCode handles **plural forms** and **close variations**:

| You say | Recognized as |
|---------|---------------|
| `"sélectionne les lignes"` | `"select line"` |
| `"ferme les onglets"` | `"close tab"` |
| `"supprime les mots"` | `"delete word"` |
| `"annulez"` | `"undo"` |
| `"sauvegardez"` | `"save"` |

---

## Configuration

Open VS Code Settings (`Ctrl+,`) and search for **VoiceCode**:

| Setting | Default | Description |
|---------|---------|-------------|
| `voicecode.language` | `"fr"` | Recognition language (`en`, `fr`) |
| `voicecode.enableNotifications` | `true` | Show VS Code notifications for actions |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+V` | Toggle recording on/off |

---

## Architecture

```
voicecode/
├── src/
│   ├── extension.ts           # VS Code extension entry point
│   ├── engine.ts              # Main orchestration engine
│   ├── state-machine.ts       # idle → recording
│   ├── config.ts              # VS Code settings reader
│   │
│   ├── stt/
│   │   └── speech-server.ts   # HTTP + WebSocket server + Chrome page
│   │
│   ├── nlu/
│   │   ├── orchestrator.ts    # Routes text through NLU layers
│   │   ├── preprocessor.ts    # Cleans text, FR→EN, plural normalization
│   │   ├── patterns.ts        # 80+ regex patterns (FR/EN)
│   │   ├── fast-path.ts       # Levenshtein fuzzy matching (120+ commands)
│   │   ├── intents.ts         # Intent definitions (80+ intents)
│   │   ├── entities.ts        # Entity extraction + dictation text processing
│   │   └── numbers.ts         # "quinze" → 15 (FR/EN)
│   │
│   ├── editor/
│   │   ├── actions.ts         # VS Code editor actions (80+ commands)
│   │   └── context.ts         # Editor state (cursor, selection)
│   │
│   └── ui/
│       └── status-bar.ts      # Recording state indicator
│
├── test/                      # 49 unit tests
└── dist/                      # Built extension
```

### Data Flow

```
Chrome Speech Recognition (Web Speech API)
    │  Google-quality transcription in FR/EN
    ▼
WebSocket (localhost)
    │  Real-time transcript streaming
    ▼
Preprocessor
    │  Remove fillers, normalize accents, FR→EN, plural normalization
    ▼
NLU Pipeline (< 1ms)
    │  Regex patterns → Levenshtein fuzzy matching
    ▼
VS Code Action
    │  Editor API calls (navigation, editing, git, debug, etc.)
    ▼
Feedback (notification + Chrome action feed)
```

---

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Language | TypeScript | VS Code native, type safety |
| Speech Recognition | Chrome Web Speech API | Google-quality, free, no setup |
| Communication | WebSocket (ws) | Real-time localhost streaming |
| NLU | Regex + Levenshtein | < 1ms latency, no model needed |
| Build | esbuild | Fast bundling, VS Code compatible |
| Testing | Vitest | Fast, TypeScript-native |

---

## Development

### Prerequisites

- Node.js 20+
- VS Code 1.95+
- Google Chrome (for speech recognition)
- Windows (primary target)

### Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Watch mode (rebuild on change)
npm run watch
```

### Run in Development

1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. The extension activates automatically
4. Press `Ctrl+Shift+V` to start recording
5. Chrome opens with the speech recognition page
6. Speak your commands!

---

## Roadmap

- [x] Chrome Web Speech API integration
- [x] WebSocket server for real-time transcripts
- [x] NLU pipeline (80+ commands FR/EN)
- [x] Fuzzy matching with plural normalization
- [x] Instant command execution
- [x] Status bar with recording state
- [x] Git commands (commit, push, pull, diff, log)
- [x] Debug commands (start, stop, step, breakpoint)
- [x] Bookmark management
- [x] Multi-cursor support
- [x] Code folding
- [x] Dictation mode (type code by voice)
- [ ] Voice Activity Detection (auto-start/stop)
- [ ] Custom command definitions
- [ ] Multi-monitor support
- [ ] Remote SSH support
- [ ] Dictation mode (type code by voice)

---

## License

MIT

---

<div align="center">

**Built with care. Your code stays on your machine.**

</div>
