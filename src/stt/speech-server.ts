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
  sendMode(dictation: boolean): void;
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
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 340px;
      grid-template-rows: auto 1fr;
      height: 100vh;
    }
    .main { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding: 16px 0; }
    .sidebar { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding: 16px 0 16px 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #e94560; }
    .subtitle { font-size: 11px; color: #666; margin-top: 2px; }

    .header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
      border-bottom: 1px solid #1e1e30;
      position: sticky;
      top: 0;
      background: #0f0f1a;
      z-index: 10;
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

    .mode-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #1a1a2e;
      color: #666;
      border: 1px solid #333;
      transition: all 0.2s;
    }
    .mode-badge.active {
      background: #7c3aed;
      color: #fff;
      border-color: #7c3aed;
      animation: pulse 2s ease-in-out infinite;
    }

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
      position: sticky;
      bottom: 0;
      background: #0f0f1a;
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
        <span id="mode-badge" class="mode-badge">Commands</span>
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
              <div class="cmd-row"><span class="cmd-fr">debut / fin</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">start / end</span></div>
              <div class="cmd-row"><span class="cmd-fr">monte / descend</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">up / down</span></div>
              <div class="cmd-row"><span class="cmd-fr">gauche / droite</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">left / right</span></div>
              <div class="cmd-row"><span class="cmd-fr">va au mot gauche</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">move word left</span></div>
              <div class="cmd-row"><span class="cmd-fr">va au mot droite</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">move word right</span></div>
              <div class="cmd-row"><span class="cmd-fr">va a la definition</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">go to definition</span></div>
              <div class="cmd-row"><span class="cmd-fr">va aux references</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">go to references</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Scroll</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">defile haut / bas</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">scroll up / down</span></div>
              <div class="cmd-row"><span class="cmd-fr">page haut / bas</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">page up / down</span></div>
              <div class="cmd-row"><span class="cmd-fr">va au debut / fin</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">scroll to top / bottom</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Editing</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">annule / refais</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">undo / redo</span></div>
              <div class="cmd-row"><span class="cmd-fr">copie / colle / coupe</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">copy / paste / cut</span></div>
              <div class="cmd-row"><span class="cmd-fr">supprime la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">delete line</span></div>
              <div class="cmd-row"><span class="cmd-fr">supprime le mot</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">delete word</span></div>
              <div class="cmd-row"><span class="cmd-fr">duplique la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">duplicate line</span></div>
              <div class="cmd-row"><span class="cmd-fr">deplace ligne haut/bas</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">move line up/down</span></div>
              <div class="cmd-row"><span class="cmd-fr">joindre lignes</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">join lines</span></div>
              <div class="cmd-row"><span class="cmd-fr">trier lignes</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">sort lines</span></div>
              <div class="cmd-row"><span class="cmd-fr">majuscule / minuscule</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">uppercase / lowercase</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Selection & Cursors</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">selectionne tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select all</span></div>
              <div class="cmd-row"><span class="cmd-fr">selectionne la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select line</span></div>
              <div class="cmd-row"><span class="cmd-fr">selectionne le mot</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select word</span></div>
              <div class="cmd-row"><span class="cmd-fr">ajoute curseur dessus</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">add cursor above</span></div>
              <div class="cmd-row"><span class="cmd-fr">ajoute curseur dessous</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">add cursor below</span></div>
              <div class="cmd-row"><span class="cmd-fr">selectionne suivante</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">select next occurrence</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouvelle ligne dessous</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">line below</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouvelle ligne dessus</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">line above</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Comment & Fold</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">commente la ligne</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle comment</span></div>
              <div class="cmd-row"><span class="cmd-fr">commente en bloc</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">block comment</span></div>
              <div class="cmd-row"><span class="cmd-fr">plie / deplie</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">fold / unfold</span></div>
              <div class="cmd-row"><span class="cmd-fr">plie tout / deplie tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">fold all / unfold all</span></div>
              <div class="cmd-row"><span class="cmd-fr">plie niveau 2</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">fold level 2</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Search & Replace</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">cherche mot</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">find word</span></div>
              <div class="cmd-row"><span class="cmd-fr">remplace X par Y</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">replace X with Y</span></div>
              <div class="cmd-row"><span class="cmd-fr">cherche suivant</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">find next</span></div>
              <div class="cmd-row"><span class="cmd-fr">remplace tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">replace all</span></div>
              <div class="cmd-row"><span class="cmd-fr">ferme la recherche</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">close search</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Tabs & Editors</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">suivant / precedent</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">next / previous tab</span></div>
              <div class="cmd-row"><span class="cmd-fr">ferme tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">close all tabs</span></div>
              <div class="cmd-row"><span class="cmd-fr">reouvre l'onglet</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">reopen closed tab</span></div>
              <div class="cmd-row"><span class="cmd-fr">epingle onglet</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">pin tab</span></div>
              <div class="cmd-row"><span class="cmd-fr">divise l'editeur</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">split editor</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Files & Terminal</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">sauvegarde / sauve tout</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">save / save all</span></div>
              <div class="cmd-row"><span class="cmd-fr">ferme l'onglet</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">close tab</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouveau fichier</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">new file</span></div>
              <div class="cmd-row"><span class="cmd-fr">ouvre le terminal</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">open terminal</span></div>
              <div class="cmd-row"><span class="cmd-fr">efface terminal</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">clear terminal</span></div>
              <div class="cmd-row"><span class="cmd-fr">focus terminal</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">focus terminal</span></div>
              <div class="cmd-row"><span class="cmd-fr">lance les tests</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">run tests</span></div>
              <div class="cmd-row"><span class="cmd-fr">compile</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">build</span></div>
              <div class="cmd-row"><span class="cmd-fr">formate</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">format</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">UI & Panels</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">montre la barre laterale</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle sidebar</span></div>
              <div class="cmd-row"><span class="cmd-fr">montre le panneau</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle panel</span></div>
              <div class="cmd-row"><span class="cmd-fr">explorateur</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle explorer</span></div>
              <div class="cmd-row"><span class="cmd-fr">zoom / dezoom</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">zoom in / out</span></div>
              <div class="cmd-row"><span class="cmd-fr">reinitialise zoom</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">reset zoom</span></div>
              <div class="cmd-row"><span class="cmd-fr">parametres</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">open settings</span></div>
              <div class="cmd-row"><span class="cmd-fr">extensions</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">open extensions</span></div>
              <div class="cmd-row"><span class="cmd-fr">nouvelle fenetre</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">new window</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Git</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">git commit</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git commit</span></div>
              <div class="cmd-row"><span class="cmd-fr">git push</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git push</span></div>
              <div class="cmd-row"><span class="cmd-fr">git pull</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git pull</span></div>
              <div class="cmd-row"><span class="cmd-fr">git statut</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git status</span></div>
              <div class="cmd-row"><span class="cmd-fr">git diff</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git diff</span></div>
              <div class="cmd-row"><span class="cmd-fr">git journal</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">git log</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Debug</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">demarre le debug</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">start debugging</span></div>
              <div class="cmd-row"><span class="cmd-fr">arrete le debug</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">stop debugging</span></div>
              <div class="cmd-row"><span class="cmd-fr">palier dessus</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">step over</span></div>
              <div class="cmd-row"><span class="cmd-fr">palier dessous</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">step into</span></div>
              <div class="cmd-row"><span class="cmd-fr">palier sortir</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">step out</span></div>
              <div class="cmd-row"><span class="cmd-fr">continue</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">continue</span></div>
              <div class="cmd-row"><span class="cmd-fr">ajoute breakpoint</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle breakpoint</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Refactor & Go To</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">renomme le symbole</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">rename symbol</span></div>
              <div class="cmd-row"><span class="cmd-fr">correction rapide</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">quick fix</span></div>
              <div class="cmd-row"><span class="cmd-fr">refactorise</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">refactor</span></div>
              <div class="cmd-row"><span class="cmd-fr">apercu definition</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">peek definition</span></div>
            </div>
          </div>
          <div>
            <div class="cmd-group-title">Bookmarks</div>
            <div class="cmd-list">
              <div class="cmd-row"><span class="cmd-fr">ajoute signet</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">toggle bookmark</span></div>
              <div class="cmd-row"><span class="cmd-fr">signet suivant</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">next bookmark</span></div>
              <div class="cmd-row"><span class="cmd-fr">signet precedent</span><span class="cmd-arrow">&rarr;</span><span class="cmd-en">previous bookmark</span></div>
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

    function setMode(dictation) {
      const badge = document.getElementById('mode-badge');
      if (dictation) {
        badge.textContent = 'Dictation';
        badge.className = 'mode-badge active';
      } else {
        badge.textContent = 'Commands';
        badge.className = 'mode-badge';
      }
    }

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
          if (msg.type === 'mode') setMode(msg.dictation);
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

    sendMode(dictation: boolean) {
      if (clientSocket && clientSocket.readyState === 1) {
        clientSocket.send(JSON.stringify({ type: "mode", dictation }));
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
