import * as vscode from "vscode";
import { AppState, StateMachine } from "./state-machine";
import { AudioCapture, createAudioCapture } from "./audio/capture";
import { AudioProcessor, createAudioProcessor } from "./audio/processor";
import { NLUOrchestrator, createNLUOrchestrator } from "./nlu/orchestrator";
import { EditorActions, createEditorActions } from "./editor/actions";
import { StatusBar } from "./ui/status-bar";
import { WebviewPanel, PanelLanguage } from "./ui/webview/panel";
import { createSpeechServer, SpeechServer } from "./stt/speech-server";
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
  const audioProcessor = createAudioProcessor();
  const nlu = createNLUOrchestrator();
  const editorActions = createEditorActions();
  const speechServer = createSpeechServer();
  let audioCapture: AudioCapture | null = null;
  let currentLang: PanelLanguage = "fr";

  function updateUI() {
    deps.statusBar.update(state.getState());
    deps.webview.sendStatus(state.getState());
  }

  state.onStateChange(() => updateUI());

  deps.webview.onLanguageChange(async (lang) => {
    currentLang = lang;
    speechServer.setLanguage(lang);
    deps.webview.sendLanguage(lang);
    log(`Language switched to: ${lang}`);
  });

  async function initSpeechServer() {
    await speechServer.start({
      onResult: async (result) => {
        if (result.isFinal) {
          log(`STT final: "${result.text}"`);
          state.transition(AppState.Processing);

          const nluResult = nlu.classify(result.text);
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
              showNotification(`Unknown command: "${result.text}"`, "warning");
            }
          }

          state.transition(AppState.Recording);
        }
      },
      onLanguageChange: (lang) => {
        currentLang = lang as PanelLanguage;
      },
    });
  }

  async function startRecording() {
    if (!state.transition(AppState.Recording)) {
      log("Cannot start: not in idle state");
      return;
    }

    const config = getConfig();

    if (!speechServer.isOpen()) {
      await initSpeechServer();
    }

    const chromeUrl = `http://127.0.0.1:${speechServer.getPort()}`;
    log(`Opening Chrome speech page: ${chromeUrl}`);
    vscode.env.openExternal(vscode.Uri.parse(chromeUrl));

    audioCapture = createAudioCapture({
      device: config.microphone,
      sampleRate: 16000,
    });

    await audioCapture.start((samples, sampleRate) => {
      if (state.isRecording()) {
        const processed = audioProcessor.processChunk(samples, sampleRate);
        deps.webview.sendAudio(processed, 16000);
      }
    });

    deps.webview.show();
    deps.webview.sendLanguage(currentLang);
    deps.webview.sendStatus("recording");
    log(`Recording started (language: ${currentLang})`);
  }

  async function stopRecording() {
    if (!state.isRecording() && !state.isProcessing()) return;

    await audioCapture?.stop();
    audioCapture = null;

    state.transition(AppState.Idle);
    deps.webview.sendStatus("idle");
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
      speechServer.stop();
      deps.statusBar.dispose();
      deps.webview.dispose();
    },
  };
}
