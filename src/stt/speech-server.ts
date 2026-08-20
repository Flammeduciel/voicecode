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
  getPort(): number;
  isOpen(): boolean;
}

function getPageHtml(wsPort: number, lang: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VoiceCode - Speech Recognition</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #eee;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #e94560;
    }
    .subtitle {
      color: #888;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .status {
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .status.listening { background: #c0392b; color: #fff; }
    .status.connected { background: #27ae60; color: #fff; }
    .status.error { background: #c0392b; color: #fff; }
    .lang-btns {
      display: flex;
      gap: 0;
      justify-content: center;
      margin-bottom: 24px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #444;
      display: inline-flex;
    }
    .lang-btn {
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      background: #2a2a3e;
      color: #aaa;
      transition: all 0.15s;
    }
    .lang-btn.active {
      background: #e94560;
      color: #fff;
    }
    .transcript {
      background: #16213e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      min-height: 80px;
      font-size: 16px;
      line-height: 1.6;
      text-align: left;
    }
    .final { color: #fff; }
    .interim { color: #888; font-style: italic; }
    .hint {
      margin-top: 16px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>VoiceCode</h1>
    <p class="subtitle">Speech Recognition - Keep this tab open</p>

    <div class="lang-btns">
      <button class="lang-btn" id="btn-en" onclick="setLang('en')">EN</button>
      <button class="lang-btn active" id="btn-fr" onclick="setLang('fr')">FR</button>
    </div>

    <div>
      <span id="status" class="status connected">Connecting...</span>
    </div>

    <div class="transcript" id="transcript">
      <span class="interim">Waiting for speech...</span>
    </div>

    <p class="hint">Speak into your microphone. This tab must stay open.</p>
  </div>

  <script>
    const LANG_MAP = { en: 'en-US', fr: 'fr-FR' };
    let currentLang = '${lang}';
    let ws = null;
    let recognition = null;

    function setStatus(text, cls) {
      const el = document.getElementById('status');
      el.textContent = text;
      el.className = 'status ' + cls;
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
        setStatus('Not supported - use Chrome', 'error');
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = LANG_MAP[currentLang] || 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcriptEl = document.getElementById('transcript');
        let html = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (result.isFinal) {
            html += '<div class="final">' + text + '</div>';
            if (ws && ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'transcript', text, isFinal: true }));
            }
          } else {
            html += '<div class="interim">' + text + '</div>';
            if (ws && ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'transcript', text, isFinal: false }));
            }
          }
        }
        transcriptEl.innerHTML = html;
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'aborted') return;
        console.error('Speech error:', event.error);
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

    function connectWebSocket() {
      ws = new WebSocket('ws://localhost:${wsPort}');

      ws.onopen = () => {
        setStatus('Connected', 'connected');
        startRecognition();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'language') {
            setLang(msg.lang);
          }
        } catch(e) {}
      };

      ws.onclose = () => {
        setStatus('Disconnected - refreshing...', 'error');
        setTimeout(() => connectWebSocket(), 2000);
      };

      ws.onerror = () => {
        setStatus('Connection error', 'error');
      };
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
        httpServer = http.createServer((req, res) => {
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

    getPort() {
      return port;
    },

    isOpen() {
      return clientSocket !== null && clientSocket.readyState === 1;
    },
  };
}
