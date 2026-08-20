import * as vscode from "vscode";

export type PanelLanguage = "en" | "fr";

export interface WebviewPanel {
  show(): void;
  hide(): void;
  toggle(): void;
  sendTranscript(text: string, isFinal: boolean): void;
  sendAction(intent: string, success: boolean): void;
  sendStatus(status: string): void;
  sendLanguage(lang: PanelLanguage): void;
  onLanguageChange(listener: (lang: PanelLanguage) => void): void;
  dispose(): void;
}

export function createWebviewPanel(extensionUri: vscode.Uri): WebviewPanel {
  let panel: vscode.WebviewPanel | undefined;
  let langListeners: ((lang: PanelLanguage) => void)[] = [];

  function getHtml(): string {
    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VoiceCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-sideBar-background);
      color: var(--vscode-foreground);
      padding: 12px;
      font-size: 13px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-widget-border);
    }
    .header h2 { font-size: 14px; font-weight: 600; flex: 1; }
    .status-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-idle { background: #333; color: #aaa; }
    .status-recording { background: #c0392b; color: #fff; }
    .status-processing { background: #2980b9; color: #fff; }
    .lang-switcher {
      display: flex;
      gap: 0;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--vscode-input-border);
    }
    .lang-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      background: var(--vscode-input-background);
      color: var(--vscode-descriptionForeground);
      transition: all 0.15s;
    }
    .lang-btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .lang-btn:hover:not(.active) {
      background: var(--vscode-input-background);
      opacity: 0.8;
    }
    .section { margin-bottom: 16px; }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .transcript-box {
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      padding: 8px;
      min-height: 60px;
      max-height: 150px;
      overflow-y: auto;
      font-family: var(--vscode-editor-font-family);
      font-size: 13px;
      line-height: 1.5;
    }
    .transcript-partial { color: var(--vscode-descriptionForeground); font-style: italic; }
    .transcript-final { color: var(--vscode-foreground); }
    .action-log {
      max-height: 200px;
      overflow-y: auto;
    }
    .action-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 0;
      border-bottom: 1px solid var(--vscode-widget-border);
      font-size: 12px;
    }
    .action-icon { font-size: 14px; }
    .action-success { color: #27ae60; }
    .action-fail { color: #c0392b; }
    .action-text { flex: 1; }
    .action-time { color: var(--vscode-descriptionForeground); font-size: 10px; }
    .empty-state {
      color: var(--vscode-descriptionForeground);
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>VoiceCode</h2>
    <div class="lang-switcher">
      <button class="lang-btn active" id="lang-en" onclick="switchLang('en')">EN</button>
      <button class="lang-btn" id="lang-fr" onclick="switchLang('fr')">FR</button>
    </div>
    <span id="status" class="status-badge status-idle">IDLE</span>
  </div>

  <div class="section">
    <div class="section-title">Transcription</div>
    <div id="transcript" class="transcript-box">
      <div class="empty-state">Press Ctrl+Shift+V to start</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Actions</div>
    <div id="actions" class="action-log"></div>
  </div>

  <script>
    const transcript = document.getElementById('transcript');
    const actions = document.getElementById('actions');
    const status = document.getElementById('status');
    let hasContent = false;

    function switchLang(lang) {
      document.getElementById('lang-en').className = 'lang-btn' + (lang === 'en' ? ' active' : '');
      document.getElementById('lang-fr').className = 'lang-btn' + (lang === 'fr' ? ' active' : '');
      vscode.postMessage({ type: 'switchLanguage', lang: lang });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;

      switch (msg.type) {
        case 'transcript':
          if (!hasContent) {
            transcript.innerHTML = '';
            hasContent = true;
          }
          const div = document.createElement('div');
          div.className = msg.isFinal ? 'transcript-final' : 'transcript-partial';
          div.textContent = msg.text;
          if (!msg.isFinal) {
            const last = transcript.lastElementChild;
            if (last && last.classList.contains('transcript-partial')) {
              last.textContent = msg.text;
              return;
            }
          }
          transcript.appendChild(div);
          transcript.scrollTop = transcript.scrollHeight;
          break;

        case 'action':
          const actionDiv = document.createElement('div');
          actionDiv.className = 'action-item';
          actionDiv.innerHTML =
            '<span class="action-icon ' + (msg.success ? 'action-success' : 'action-fail') + '">' +
            (msg.success ? '\\u2714' : '\\u2718') + '</span>' +
            '<span class="action-text">' + msg.intent + '</span>' +
            '<span class="action-time">' + new Date().toLocaleTimeString() + '</span>';
          actions.insertBefore(actionDiv, actions.firstChild);
          break;

        case 'status':
          status.textContent = msg.status.toUpperCase();
          status.className = 'status-badge status-' + msg.status;
          break;

        case 'language':
          document.getElementById('lang-en').className = 'lang-btn' + (msg.lang === 'en' ? ' active' : '');
          document.getElementById('lang-fr').className = 'lang-btn' + (msg.lang === 'fr' ? ' active' : '');
          break;
      }
    });
  </script>
</body>
</html>`;
  }

  return {
    show() {
      if (panel) {
        panel.reveal(vscode.ViewColumn.Beside);
        return;
      }
      panel = vscode.window.createWebviewPanel(
        "voicecode",
        "VoiceCode",
        { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
        { enableScripts: true, retainContextWhenHidden: true }
      );
      panel.webview.html = getHtml();

      panel.webview.onDidReceiveMessage((msg) => {
        if (msg.type === "switchLanguage") {
          for (const listener of langListeners) {
            listener(msg.lang as PanelLanguage);
          }
        }
      });

      panel.onDidDispose(() => {
        panel = undefined;
      });
    },

    hide() {
      panel?.dispose();
      panel = undefined;
    },

    toggle() {
      if (panel) {
        this.hide();
      } else {
        this.show();
      }
    },

    sendTranscript(text: string, isFinal: boolean) {
      panel?.webview.postMessage({ type: "transcript", text, isFinal });
    },

    sendAction(intent: string, success: boolean) {
      panel?.webview.postMessage({ type: "action", intent, success });
    },

    sendStatus(status: string) {
      panel?.webview.postMessage({ type: "status", status });
    },

    sendLanguage(lang: PanelLanguage) {
      panel?.webview.postMessage({ type: "language", lang });
    },

    onLanguageChange(listener: (lang: PanelLanguage) => void) {
      langListeners.push(listener);
    },

    dispose() {
      panel?.dispose();
      panel = undefined;
    },
  };
}
