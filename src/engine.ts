import { AppState, StateMachine } from "./state-machine";
import { AudioCapture, createAudioCapture } from "./audio/capture";
import { AudioProcessor, createAudioProcessor } from "./audio/processor";
import { STTManager, createSTTManager } from "./stt/manager";
import { NLUOrchestrator, createNLUOrchestrator } from "./nlu/orchestrator";
import { EditorActions, createEditorActions } from "./editor/actions";
import { StatusBar } from "./ui/status-bar";
import { WebviewPanel } from "./ui/webview/panel";
import { getConfig } from "./config";
import { log, logError } from "./utils/logger";

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
  const sttManager = createSTTManager();
  const nlu = createNLUOrchestrator();
  const editorActions = createEditorActions();
  let audioCapture: AudioCapture | null = null;

  function updateUI(text?: string) {
    deps.statusBar.update(state.getState(), text);
    deps.webview.sendStatus(state.getState());
  }

  state.onStateChange(() => updateUI());

  async function startRecording() {
    if (!state.transition(AppState.Recording)) {
      log("Cannot start: not in idle state");
      return;
    }

    const config = getConfig();

    await sttManager.start(async (result) => {
      if (result.isFinal) {
        deps.webview.sendTranscript(result.text, true);
        state.transition(AppState.Processing);

        const nluResult = nlu.classify(result.text);
        log(`Intent: ${nluResult.intent} (${nluResult.confidence})`);

        const success = await editorActions.execute(nluResult);
        deps.webview.sendAction(`${nluResult.intent}`, success);

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
      } else {
        deps.webview.sendTranscript(result.text, false);
        updateUI(result.text);
      }
    });

    audioCapture = createAudioCapture({
      device: config.microphone,
      sampleRate: 16000,
    });

    await audioCapture.start((samples, sampleRate) => {
      if (state.isRecording()) {
        const processed = audioProcessor.processChunk(samples, sampleRate);
        sttManager.feedAudio(processed, 16000);
      }
    });

    deps.webview.show();
    log("Recording started");
  }

  async function stopRecording() {
    if (!state.isRecording() && !state.isProcessing()) return;

    await audioCapture?.stop();
    audioCapture = null;
    await sttManager.stop();

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
