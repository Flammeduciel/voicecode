import * as vscode from "vscode";
import { AppState, StateMachine } from "./state-machine";
import { AudioCapture, createAudioCapture } from "./audio/capture";
import { AudioProcessor, createAudioProcessor } from "./audio/processor";
import { NLUOrchestrator, createNLUOrchestrator } from "./nlu/orchestrator";
import { EditorActions, createEditorActions } from "./editor/actions";
import { StatusBar } from "./ui/status-bar";
import { createSpeechServer, SpeechServer } from "./stt/speech-server";
import { showNotification } from "./utils/debounce";
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
}

export function createEngine(deps: EngineDeps): Engine {
  const state = new StateMachine();
  const audioProcessor = createAudioProcessor();
  const nlu = createNLUOrchestrator();
  const editorActions = createEditorActions();
  const speechServer = createSpeechServer();
  let audioCapture: AudioCapture | null = null;

  function updateUI() {
    deps.statusBar.update(state.getState());
  }

  state.onStateChange(() => updateUI());

  function handleFinal(text: string) {
    log(`STT final: "${text}"`);

    const nluResult = nlu.classify(text);
    log(`Intent: ${nluResult.intent} (${nluResult.confidence})`);

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

    audioCapture = createAudioCapture({ device: "default", sampleRate: 16000 });

    await audioCapture.start((samples, sampleRate) => {
      if (state.isRecording()) {
        audioProcessor.processChunk(samples, sampleRate);
      }
    });

    log("Recording started");
  }

  async function stopRecording() {
    if (!state.isRecording() && !state.isProcessing()) return;

    await audioCapture?.stop();
    audioCapture = null;

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
      speechServer.stop();
      deps.statusBar.dispose();
    },
  };
}
