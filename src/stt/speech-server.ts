import * as http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { log } from "../utils/logger";

export type SpeechResult = {
  text: string;
  isFinal: boolean;
};

export type SpeechServerListener = {
  onResult: (result: SpeechResult) => void;
  onLanguageChange: (lang: string) => void;
};

export interface SpeechServer {
  start(listener: SpeechServerListener): Promise<void>;
  stop(): void;
  setLanguage(lang: string): void;
  sendAction(intent: string, success: boolean): void;
  getPort(): number;
  isOpen(): boolean;
}

function getPageHtml(wsPort: number, lang: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VoiceCode</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, sans-serif;
      background: #0f0f1a;
      color: #e0e0e0;
      min-height: 100vh;
    }
    .app {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 16px;
      min-height: 100vh;
    }
    .main { display: flex; flex-direction: column; gap: 16px; }
    .sidebar { display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #e94560; }
    .subtitle { font-size: 11px; color: #666; margin-top: 2px; }

    .header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #1e1e30;
    }
    .header-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }

    .status-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-connecting { background: #333; color: #aaa; }
    .status-listening { background: #c0392b; color: #fff; animation: pulse 1.5s ease-in-out infinite; }
    .status-idle { background: #1a472a; color: #4ade80; }
    .status-error { background: #7f1d1d; color: #fca5a5; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

    .lang-btns {
      display: inline-flex;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #333;
    }
    .lang-btn {
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      background: #1a1a2e;
      color: #666;
      transition: all 0.15s;
    }
    .lang-btn.active { background: #e94560; color: #fff; }
    .lang-btn:hover:not(.active) { background: #22223a; color: #aaa; }

    .card {
      background: #161625;
      border: 1px solid #1e1e30;
      border-radius: 10px;
      padding: 14px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555;
      margin-bottom: 10px;
    }

    .transcript-box {
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 15px;
      line-height: 1.7;
      min-height: 60px;
      max-height: 200px;
      overflow-y: auto;
    }
    .tr-final { color: #fff; padding: 2px 0; }
    .tr-interim { color: #555; font-style: italic; padding: 2px 0; }
    .tr-empty { color: #333; font-size: 13px; }

    .action-feed { max-height: 240px; overflow-y: auto; }
    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid #1e1e30;
      font-size: 12px;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; } }
    .action-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .action-dot.ok { background: #4ade80; }
    .action-dot.fail { background: #f87171; }
    .action-name { flex: 1; color: #ccc; font-family: 'Cascadia Code', monospace; font-size: 11px; }
    .action-time { color: #444; font-size: 10px; font-family: 'Cascadia Code', monospace; }
    .action-empty { color: #333; font-size: 12px; text-align: center; padding: 16px 0; }

    .commands-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cmd-group-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #e94560;
      margin-bottom: 2px;
    }
    .cmd-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .cmd-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-size: 11px;
      line-height: 1.5;
    }
    .cmd-fr {
      color: #e0e0e0;
      font-family: 'Cascadia Code', monospace;
      font-size: 11px;
      min-width: 0;
      white-space: nowrap;
    }
    .cmd-en {
      color: #555;
      font-family: 'Cascadia Code', monospace;
      font-size: 10px;
    }
    .cmd-arrow { color: #333; font-size: 9px; }

    .hint-bar {
      grid-column: 1 / -1;
      text-align: center;
      padding: 8px;
      color: #444;
      font-size: 11px;
      border-top: 1px solid #1e1e30;
    }
  </style>
</head>
<body>
  <div class="app">
    <div class="header">
      <div>
        <h1>VoiceCode</h1>
        <div class="subtitle">Speak commands in French or English</div>
      </div>
      <div class="header-right">
        <div class="lang-btns">
          <button class="lang-btn" id="btn-en" onclick="setLang('en')">EN</button>
          <button class="lang-btn active" id="btn-fr" onclick="setLang('fr')">FR</button>
        </div>
        <span id="status" class="status-pill status-connecting">Connecting</span>
      </div>
    </div>

    <div class="main">
      <div class="card">
        <div class="card-title">Transcription</div>
        <div class="transcript-box" id="transcript">
          <div class="tr-empty">Waiting for speech...</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Executed Commands</div>
        <div class="action-feed" id="actions">
          <div class="action-empty">No commands yet</div>
        </div>
      </div>
    </div>

    <div class="sidebar">
      <div class="card" style="flex: 1; overflow-y: auto;">
        <div class="card-title">Available Commands</div>
        <div class="commands-grid">

          <div>
            <div class="cmd-group-title">Navigation</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">va a la ligne 15</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">go to line 15</span></div>
              <div class="cmd-row"><span class="cmd-fr">debut</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">start</span></div>
              <div class="cmd-row"><span class="cmd-fr">fin</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">end</span></div>
              <div class="cmd-row"><span class="cmd-fr">monte</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">up</span></div>
              <div class="cmd-row"><span class="cmd-fr">descend</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">down</span></div>
              <div class="cmd-row"><span class="cmd-fr">gauche</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">left</span></div>
              <div class="cmd-row"><span class="cmd-fr">droite</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">right</span></div>
            </div>
          </div>

          <div>
            <div class="cmd-group-title">Editing</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">annule</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">undo</span></div>
              <div class="cmd-row"><span class="cmd-fr">refais</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">redo</span></div>
              <div class="cmd-row"><span class="cmd-fr">copie</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">copy</span></div>
              <div class="cmd-row"><span class="cmd-fr">colle</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">paste</span></div>
              <div class="cmd-row"><span class="cmd-fr">coupe</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">cut</span></div>
              <div class="cmd-row"><span class="cmd-fr">supprime la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">delete line</span></div>
              <div class="cmd-row"><span class="cmd-fr">duplique la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">duplicate line</span></div>
            </div>
          </div>

          <div>
            <div class="cmd-group-title">Selection</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">selection tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select all</span></div>
              <div class="cmd-row"><span class="cmd-fr">selectionne la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select line</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouvelle ligne dessous</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">line below</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouvelle ligne dessus</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">line above</span></div>
            </div>
          </div>

          <div>
            <div class="cmd-group-title">Search & Replace</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">remplace X par Y</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">replace X with Y</span></div>
              <div class="cmd-row"><span class="cmd-fr">cherche mot</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">find word</span></div>
            </div>
          </div>

          <div>
            <div class="cmd-group-title">Files & Terminal</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">sauvegarde</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">save</span></div>
              <div class="cmd-row"><span class="cmd-fr">ferme l'onglet</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">close tab</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouveau fichier</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">new file</span></div>
              <div class="cmd-row"><span class="cmd-fr">ouvre le terminal</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">open terminal</span></div>
              <div class="cmd-row"><span class="cmd-fr">lance les tests</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">run tests</span></div>
              <div class="cmd-row"><span class="cmd-fr">compile</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">build</span></div>
              <div class="cmd-row"><span class="cmd-fr">formate</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">format</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="hint-bar">
      Ctrl+Shift+V in VS Code to start &middot; Keep this tab open &middot; Speak naturally in FR or EN
    </div>
  </div>

  <script>
    const LANG_MAP = { en: 'en-US', fr: 'fr-FR' };
    let currentLang = '${lang}';
    let ws = null;
    let recognition = null;

    function setStatus(text, cls) {
      const el = document.getElementById('status');
      el.textContent = text;
      el.className = 'status-pill status-' + cls;
    }

    function setLang(lang) {
      currentLang = lang;
      document.getElementById('btn-en').className = 'lang-btn' + (lang === 'en' ? ' active' : '');
      document.getElementById('btn-fr').className = 'lang-btn' + (lang === 'fr' ? ' active' : '');
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'language', lang }));
      }
      restartRecognition();
    }

    function restartRecognition() {
      if (recognition) {
        try { recognition.abort(); } catch(e) {}
      }
      startRecognition();
    }

    function startRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setStatus('Use Chrome', 'error');
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = LANG_MAP[currentLang] || 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const el = document.getElementById('transcript');
        let html = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          const text = r[0].transcript.trim();
          if (r.isFinal) {
            html += '<div class="tr-final">' + esc(text) + '</div>';
            if (ws && ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'transcript', text: text, isFinal: true }));
            }
          } else {
            html += '<div class="tr-interim">' + esc(text) + '</div>';
          }
        }
        el.innerHTML = html;
        el.scrollTop = el.scrollHeight;
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        setStatus('Error: ' + event.error, 'error');
      };

      recognition.onend = () => {
        if (ws && ws.readyState === 1) {
          try { recognition.start(); } catch(e) {}
        }
      };

      try {
        recognition.start();
        setStatus('Listening (' + currentLang.toUpperCase() + ')', 'listening');
      } catch(e) {
        setStatus('Failed to start', 'error');
      }
    }

    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function addAction(intent, success) {
      const el = document.getElementById('actions');
      const empty = el.querySelector('.action-empty');
      if (empty) empty.remove();
      const now = new Date();
      const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const div = document.createElement('div');
      div.className = 'action-item';
      div.innerHTML =
        '<span class="action-dot ' + (success ? 'ok' : 'fail') + '"></span>' +
        '<span class="action-name">' + esc(intent) + '</span>' +
        '<span class="action-time">' + time + '</span>';
      el.insertBefore(div, el.firstChild);
      while (el.children.length > 50) el.removeChild(el.lastChild);
    }

    function connectWebSocket() {
      ws = new WebSocket('ws://localhost:${wsPort}');

      ws.onopen = () => {
        setStatus('Listening (' + currentLang.toUpperCase() + ')', 'listening');
        startRecognition();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'language') setLang(msg.lang);
          if (msg.type === 'action') addAction(msg.intent, msg.success);
        } catch(e) {}
      };

      ws.onclose = () => {
        setStatus('Reconnecting', 'connecting');
        setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => setStatus('Connection error', 'error');
    }

    connectWebSocket();
  </script>
</body>
</html>`;
}

export function createSpeechServer(): SpeechServer {
  let httpServer: http.Server | null = null;
  let wsServer: WebSocketServer | null = null;
  let port = 0;
  let currentLang = "fr";
  let listener: SpeechServerListener | null = null;
  let clientSocket: WebSocket | null = null;

  return {
    async start(listeners: SpeechServerListener) {
      listener = listeners;

      return new Promise<void>((resolve, reject) => {
        httpServer = http.createServer((_req, res) => {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(getPageHtml(port, currentLang));
        });

        httpServer.listen(0, "127.0.0.1", () => {
          port = (httpServer!.address() as any).port;
          log(`Speech server started on port ${port}`);

          wsServer = new WebSocketServer({ server: httpServer! });

          wsServer.on("connection", (ws) => {
            log("Chrome connected to speech server");
            clientSocket = ws;

            ws.on("message", (data) => {
              try {
                const msg = JSON.parse(data.toString());
                if (msg.type === "transcript" && listener) {
                  listener.onResult({ text: msg.text, isFinal: msg.isFinal });
                }
                if (msg.type === "language" && listener) {
                  listener.onLanguageChange(msg.lang);
                }
              } catch (e) {}
            });

            ws.on("close", () => {
              log("Chrome disconnected from speech server");
              clientSocket = null;
            });

            ws.send(JSON.stringify({ type: "language", lang: currentLang }));
          });

          resolve();
        });

        httpServer.on("error", (err) => {
          log("Speech server error: " + err.message);
          reject(err);
        });
      });
    },

    stop() {
      clientSocket?.close();
      clientSocket = null;
      wsServer?.close();
      wsServer = null;
      httpServer?.close();
      httpServer = null;
      port = 0;
      log("Speech server stopped");
    },

    setLanguage(lang: string) {
      currentLang = lang;
      if (clientSocket && clientSocket.readyState === 1) {
        clientSocket.send(JSON.stringify({ type: "language", lang }));
      }
    },

    sendAction(intent: string, success: boolean) {
      if (clientSocket && clientSocket.readyState === 1) {
        clientSocket.send(JSON.stringify({ type: "action", intent, success }));
      }
    },

    getPort() {
      return port;
    },

    isOpen() {
      return clientSocket !== null && clientSocket.readyState === 1;
    },
  };
}
