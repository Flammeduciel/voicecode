<div align="center">

# VoiceCode

### Code with your voice. No keyboard. No cloud. No subscriptions.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.95+-007ACC.svg)](https://code.visualstudio.com/)
[![Tests](https://img.shields.io/badge/tests-37%20passing-brightgreen)]()
[![Platform](https://img.shields.io/badge/platform-Windows-blue)]()

</div>

---

## What is VoiceCode?

VoiceCode is a **VS Code extension** that lets you write code entirely by voice. Speak your commands in **French or English**, and VoiceCode understands and executes them instantly.

- **Zero subscriptions** — no API keys, no cloud services, no monthly fees
- **100% local** — everything runs on your machine, your code never leaves your computer
- **Privacy-first** — no data sent anywhere, ever
- **Bilingual** — speak French or English, VoiceCode understands both

---

## How it Works

```
You speak → Micro captures → Speech-to-Text (local) → NLU interprets → VS Code executes
```

1. **Press `Ctrl+Shift+V`** to start listening
2. **Speak a command** like `"supprime la ligne 15"` or `"undo"`
3. **VoiceCode executes it** in your editor instantly

The entire pipeline runs locally on your machine:

| Component | Technology | Size |
|-----------|-----------|------|
| Microphone capture | node-cpal (native) | ~2 MB |
| Speech-to-Text | sherpa-onnx Zipformer | ~296 MB |
| Voice Activity Detection | Silero VAD | ~2 MB |
| NLU (intent recognition) | Regex + Levenshtein | ~5 KB |
| Total download | | **~300 MB** |

No internet required after initial setup.

---

## Quick Start

### 1. Download the STT Model (~296 MB)

Run this PowerShell script from the project root:

```powershell
./scripts/download-models.ps1
```

Or download manually from:
https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-en-2023-06-26.tar.bz2

Extract to `models/sherpa-onnx-streaming-zipformer-en-2023-06-26/`.

### 2. Install Dependencies

```bash
npm install
```

### 3. Build

```bash
npm run build
```

### 4. Run in VS Code

1. Open this project in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new VS Code window, press `Ctrl+Shift+V` to start recording

---

## Voice Commands

### Navigation

| French | English | Action |
|--------|---------|--------|
| `"va à la ligne 15"` | `"go to line 15"` | Jump to line 15 |
| `"va au début"` | `"go to start"` | Jump to start of file |
| `"va à la fin"` | `"go to end"` | Jump to end of file |
| `"monte"` | `"go up"` | Move cursor up |
| `"descend"` | `"go down"` | Move cursor down |
| `"gauche"` | `"go left"` | Move cursor left |
| `"droite"` | `"go right"` | Move cursor right |

### Editing

| French | English | Action |
|--------|---------|--------|
| `"annule"` | `"undo"` | Undo last action |
| `"refais"` | `"redo"` | Redo last action |
| `"supprime la ligne"` | `"delete line"` | Delete current line |
| `"supprime la ligne 15"` | `"delete line 15"` | Delete specific line |
| `"duplique la ligne"` | `"duplicate line"` | Duplicate current line |
| `"copie"` | `"copy"` | Copy to clipboard |
| `"colle"` | `"paste"` | Paste from clipboard |
| `"coupe"` | `"cut"` | Cut to clipboard |
| `"sélectionne tout"` | `"select all"` | Select all text |
| `"sélectionne la ligne"` | `"select line"` | Select current line |
| `"nouvelle ligne en dessous"` | `"new line below"` | Insert line below |
| `"nouvelle ligne au-dessus"` | `"new line above"` | Insert line above |
| `"indente"` | `"indent"` | Indent line |
| `"déindente"` | `"outdent"` | Outdent line |

### Search & Replace

| French | English | Action |
|--------|---------|--------|
| `"remplace foo par bar"` | `"replace foo with bar"` | Find and replace |
| `"cherche HelloWorld"` | `"find HelloWorld"` | Search in file |

### Files & Terminal

| French | English | Action |
|--------|---------|--------|
| `"sauvegarde"` | `"save"` | Save current file |
| `"ferme l'onglet"` | `"close tab"` | Close current tab |
| `"nouveau fichier"` | `"new file"` | Create new file |
| `"ouvre le terminal"` | `"open terminal"` | Open terminal panel |
| `"lance les tests"` | `"run tests"` | Run test command |
| `"compile"` | `"build"` | Run build command |

### Formatting

| French | English | Action |
|--------|---------|--------|
| `"formate"` | `"format"` | Format document |

### Punctuation (while dictating)

| Say | Get |
|-----|-----|
| `"point"` / `"period"` | `.` |
| `"virgule"` / `"comma"` | `,` |
| `"point virgule"` / `"semicolon"` | `;` |
| `"deux points"` / `"colon"` | `:` |
| `"parenthèse ouvrante"` / `"open paren"` | `(` |
| `"parenthèse fermante"` / `"close paren"` | `)` |
| `"accolade ouvrante"` / `"open brace"` | `{` |
| `"accolade fermante"` / `"close brace"` | `}` |

---

## Configuration

Open VS Code Settings (`Ctrl+,`) and search for **VoiceCode**:

| Setting | Default | Description |
|---------|---------|-------------|
| `voicecode.microphone` | `"default"` | Microphone device name or `"default"` |
| `voicecode.language` | `"auto"` | Recognition language (`auto`, `en`, `fr`) |
| `voicecode.modelDir` | `""` | Custom path to STT model directory |
| `voicecode.vadThreshold` | `0.5` | Voice detection sensitivity (0-1) |
| `voicecode.silenceTimeout` | `1200` | Silence duration (ms) before finalizing speech |
| `voicecode.enableNotifications` | `true` | Show VS Code notifications for actions |
| `voicecode.enableWebview` | `true` | Show the VoiceCode control panel |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+V` | Toggle recording on/off |
| `Ctrl+Shift+P` | Open VoiceCode control panel |

---

## Architecture

```
voicecode/
├── src/
│   ├── extension.ts           # VS Code extension entry point
│   ├── engine.ts              # Main orchestration engine
│   ├── state-machine.ts       # idle → recording → processing
│   ├── config.ts              # VS Code settings reader
│   │
│   ├── audio/
│   │   ├── capture.ts         # Microphone → Float32Array (node-cpal)
│   │   └── processor.ts       # Audio normalization/resampling
│   │
│   ├── stt/
│   │   ├── engine.ts          # STT interface
│   │   ├── sherpa.ts          # sherpa-onnx streaming recognizer
│   │   └── manager.ts         # STT lifecycle management
│   │
│   ├── nlu/
│   │   ├── orchestrator.ts    # Routes text through NLU layers
│   │   ├── preprocessor.ts    # Cleans text, FR→EN synonyms
│   │   ├── patterns.ts        # 35+ regex patterns (FR/EN)
│   │   ├── fast-path.ts       # Levenshtein fuzzy matching
│   │   ├── intents.ts         # Intent definitions
│   │   ├── entities.ts        # Entity extraction (numbers, files)
│   │   └── numbers.ts         # "quinze" → 15 (FR/EN)
│   │
│   ├── editor/
│   │   ├── actions.ts         # VS Code editor actions
│   │   └── context.ts         # Editor state (cursor, selection)
│   │
│   └── ui/
│       ├── status-bar.ts      # Recording state indicator
│       └── webview/
│           └── panel.ts       # Live transcript + action log
│
├── test/                      # 37 unit tests
├── scripts/
│   └── download-models.ps1    # Model download script
└── models/                    # STT models (after download)
```

### Data Flow

```
Microphone Audio (16kHz PCM)
    │
    ▼
Voice Activity Detection (Silero VAD)
    │  Detects speech start/end, filters silence
    ▼
Speech-to-Text (sherpa-onnx Zipformer)
    │  Real-time streaming transcription
    ▼
Preprocessor
    │  Remove fillers, normalize accents, FR→EN synonyms
    ▼
NLU Fast Path (< 1ms)
    │  Regex patterns + Levenshtein fuzzy matching
    ▼
VS Code Action
    │  Editor API calls (navigation, editing, files, terminal)
    ▼
Feedback (notification + webview update)
```

---

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Language | TypeScript | VS Code native, type safety |
| STT | sherpa-onnx | True streaming, prebuilt binaries, no compilation |
| VAD | Silero VAD | Integrated with sherpa-onnx |
| NLU | Regex + Levenshtein | < 1ms latency, no model needed |
| Build | esbuild | Fast bundling, VS Code compatible |
| Testing | Vitest | Fast, TypeScript-native |

---

## Development

### Prerequisites

- Node.js 20+
- VS Code 1.95+
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

# Download STT model
./scripts/download-models.ps1
```

### Run in Development

1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. The extension activates automatically
4. Press `Ctrl+Shift+V` to start recording

---

## Roadmap

- [x] Audio capture (node-cpal)
- [x] STT streaming (sherpa-onnx)
- [x] NLU fast path (35+ commands)
- [x] Editor actions (navigation, editing, files)
- [x] Webview panel with live transcript
- [x] Status bar with recording state
- [x] Bilingual support (FR/EN)
- [ ] Voice Activity Detection tuning
- [ ] Local LLM integration (code generation)
- [ ] Custom command definitions
- [ ] Multi-monitor support
- [ ] Remote SSH support

---

## License

MIT

---

<div align="center">

**Built with care. Your code stays on your machine.**

</div>
