import * as vscode from "vscode";
import { AppState, StateMachine } from "./state-machine";
import { NLUOrchestrator, createNLUOrchestrator } from "./nlu/orchestrator";
import { Intent, NLUResult } from "./nlu/intents";
import { EditorActions, createEditorActions } from "./editor/actions";
import { StatusBar } from "./ui/status-bar";
import { createSpeechServer, SpeechServer } from "./stt/speech-server";
import { processDictationText } from "./nlu/entities";
import { showNotification } from "./utils/debounce";
import { getConfig } from "./config";
import { log } from "./utils/logger";

export interface Engine {
  start(): Promise<void>;
  stop(): Promise<void>;
  toggle(): Promise<void>;
  toggleDictation(): void;
  isDictating(): boolean;
  dispose(): Promise<void>;
}

export interface EngineDeps {
  statusBar: StatusBar;
}

export function createEngine(deps: EngineDeps): Engine {
  const state = new StateMachine();
  const nlu = createNLUOrchestrator();
  const editorActions = createEditorActions();
  const speechServer = createSpeechServer();
  let dictationMode = false;

  function updateUI() {
    deps.statusBar.update(state.getState(), dictationMode);
  }

  state.onStateChange(() => updateUI());

  function sendModeToChrome() {
    speechServer.sendMode(dictationMode);
  }

  function toggleDictation() {
    dictationMode = !dictationMode;
    log(`Dictation mode: ${dictationMode}`);
    sendModeToChrome();
    updateUI();
    showNotification(dictationMode ? "Mode dictée activé" : "Mode dictée désactivé");
  }

  function handleFinal(text: string) {
    log(`STT final: "${text}"`);

    if (dictationMode) {
      const processed = processDictationText(text);
      log(`Dictation insert: "${processed}"`);

      const dictationResult: NLUResult = {
        intent: Intent.InsertText,
        confidence: 1.0,
        entities: { text: processed },
        rawText: text,
      };

      editorActions.execute(dictationResult).then((success) => {
        const config = getConfig();
        if (config.enableNotifications && success) {
          showNotification(`Dictated: "${processed}"`);
        }
      });

      speechServer.sendAction("insert_text", true);
      return;
    }

    const nluResult = nlu.classify(text);
    log(`Intent: ${nluResult.intent} (${nluResult.confidence})`);

    if (nluResult.intent === Intent.DictateToggle) {
      toggleDictation();
      speechServer.sendAction(nluResult.intent, true);
      return;
    }

    editorActions.execute(nluResult).then((success) => {
      const config = getConfig();
      if (config.enableNotifications) {
        if (success) {
          showNotification(`Executed: ${nluResult.intent}`);
        } else if (nluResult.intent !== "unknown") {
          showNotification(`Could not execute: ${nluResult.intent}`, "warning");
        } else {
          showNotification(`Unknown: "${text}"`, "warning");
        }
      }
    });

    speechServer.sendAction(nluResult.intent, true);
  }

  async function initSpeechServer() {
    await speechServer.start({
      onResult: (result) => {
        if (result.isFinal) {
          handleFinal(result.text);
        }
      },
      onLanguageChange: (lang) => {
        log(`Language switched to: ${lang}`);
      },
    });
  }

  async function startRecording() {
    if (!state.transition(AppState.Recording)) {
      log("Cannot start: not in idle state");
      return;
    }

    if (!speechServer.isOpen()) {
      await initSpeechServer();
    }

    const chromeUrl = `http://127.0.0.1:${speechServer.getPort()}`;
    log(`Opening Chrome speech page: ${chromeUrl}`);
    vscode.env.openExternal(vscode.Uri.parse(chromeUrl));

    log("Recording started");
  }

  async function stopRecording() {
    if (!state.isRecording() && !state.isProcessing()) return;

    dictationMode = false;
    sendModeToChrome();
    state.transition(AppState.Idle);
    log("Recording stopped");
  }

  return {
    async start() {
      await startRecording();
    },

    async stop() {
      await stopRecording();
    },

    async toggle() {
      if (state.isRecording() || state.isProcessing()) {
        await stopRecording();
      } else {
        await startRecording();
      }
    },

    toggleDictation() {
      toggleDictation();
    },

    isDictating() {
      return dictationMode;
    },

    async dispose() {
      await stopRecording();
      speechServer.stop();
      deps.statusBar.dispose();
    },
  };
}
