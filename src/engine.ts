import { AppState, StateMachine } from "./state-machine";
import { NLUOrchestrator, createNLUOrchestrator } from "./nlu/orchestrator";
import { EditorActions, createEditorActions } from "./editor/actions";
import { StatusBar } from "./ui/status-bar";
import { WebviewPanel, PanelLanguage } from "./ui/webview/panel";
import { getConfig } from "./config";
import { log } from "./utils/logger";

export interface Engine {
  start(): Promise<void>;
  stop(): Promise<void>;
  toggle(): Promise<void>;
  dispose(): Promise<void>;
}

export interface EngineDeps {
  statusBar: StatusBar;
  webview: WebviewPanel;
}

export function createEngine(deps: EngineDeps): Engine {
  const state = new StateMachine();
  const nlu = createNLUOrchestrator();
  const editorActions = createEditorActions();
  let currentLang: PanelLanguage = "fr";

  function updateUI() {
    deps.statusBar.update(state.getState());
    deps.webview.sendStatus(state.getState());
  }

  state.onStateChange(() => updateUI());

  deps.webview.onLanguageChange(async (lang) => {
    currentLang = lang;
    deps.webview.sendLanguage(lang);
    log(`Language switched to: ${lang}`);
  });

  deps.webview.onTranscript(async (text, isFinal) => {
    if (isFinal) {
      log(`STT final: "${text}"`);
      state.transition(AppState.Processing);

      const nluResult = nlu.classify(text);
      log(`Intent: ${nluResult.intent} (${nluResult.confidence})`);

      const success = await editorActions.execute(nluResult);
      deps.webview.sendAction(`${nluResult.intent}`, success);

      const config = getConfig();
      if (config.enableNotifications) {
        const { showNotification } = await import("./utils/debounce");
        if (success) {
          showNotification(`Executed: ${nluResult.intent}`);
        } else if (nluResult.intent !== "unknown") {
          showNotification(`Could not execute: ${nluResult.intent}`, "warning");
        } else {
          showNotification(`Unknown command: "${text}"`, "warning");
        }
      }

      state.transition(AppState.Recording);
    }
  });

  async function startRecording() {
    if (!state.transition(AppState.Recording)) {
      log("Cannot start: not in idle state");
      return;
    }

    deps.webview.show();
    deps.webview.sendLanguage(currentLang);
    deps.webview.sendStartListening();

    log(`Recording started (language: ${currentLang})`);
  }

  async function stopRecording() {
    if (!state.isRecording() && !state.isProcessing()) return;

    deps.webview.sendStopListening();

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

    async dispose() {
      await stopRecording();
      deps.statusBar.dispose();
      deps.webview.dispose();
    },
  };
}
