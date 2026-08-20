import * as vscode from "vscode";
import { initLogger, log, logError } from "./utils/logger";
import { createEngine, Engine } from "./engine";
import { createStatusBar } from "./ui/status-bar";

let engine: Engine | undefined;

export function activate(context: vscode.ExtensionContext) {
  initLogger();
  log("VoiceCode activating...");

  const statusBar = createStatusBar();
  statusBar.show();

  engine = createEngine({ statusBar });

  const toggleCmd = vscode.commands.registerCommand("voicecode.toggle", async () => {
    try {
      await engine?.toggle();
    } catch (err) {
      logError("Toggle failed", err);
      vscode.window.showErrorMessage(`VoiceCode: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  const startCmd = vscode.commands.registerCommand("voicecode.start", async () => {
    try {
      await engine?.start();
    } catch (err) {
      logError("Start failed", err);
      vscode.window.showErrorMessage(`VoiceCode: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  const stopCmd = vscode.commands.registerCommand("voicecode.stop", async () => {
    try {
      await engine?.stop();
    } catch (err) {
      logError("Stop failed", err);
    }
  });

  const dictateCmd = vscode.commands.registerCommand("voicecode.dictate", async () => {
    try {
      engine?.toggleDictation();
    } catch (err) {
      logError("Dictate toggle failed", err);
    }
  });

  const helpCmd = vscode.commands.registerCommand("voicecode.showCommands", () => {
    const commands = [
      "Dictation: 'dicte' (enter), 'arrete la dictee' (exit)",
      "Navigation: 'va a la ligne 15', 'debut', 'fin', 'monte', 'descend', 'gauche', 'droite'",
      "Scroll: 'defile haut', 'page bas'",
      "Editing: 'annule', 'refais', 'copie', 'colle', 'coupe', 'supprime la ligne', 'duplique la ligne'",
      "Move: 'deplace ligne haut', 'joindre lignes', 'trier lignes', 'majuscule', 'minuscule'",
      "Selection: 'selectionne tout', 'selectionne la ligne', 'selectionne le mot'",
      "Multi-cursor: 'ajoute curseur dessus', 'selectionne suivante'",
      "Comment: 'commente la ligne', 'commente en bloc'",
      "Fold: 'plie', 'deplie', 'plie tout'",
      "Search: 'cherche mot', 'remplace X par Y', 'cherche suivant', 'remplace tout'",
      "Tabs: 'suivant', 'precedent', 'ferme tout', 'reouvre l'onglet'",
      "Files: 'sauvegarde', 'nouveau fichier', 'ferme l'onglet'",
      "Terminal: 'ouvre le terminal', 'efface terminal', 'focus terminal'",
      "Panels: 'montre barre laterale', 'explorateur', 'parametres'",
      "Git: 'git commit', 'git push', 'git pull', 'git statut'",
      "Debug: 'demarre le debug', 'arrete', 'palier dessus', 'palier dessous'",
      "Refactor: 'renomme le symbole', 'correction rapide', 'refactorise'",
    ];
    vscode.window.showInformationMessage(
      "VoiceCode Commands:\n" + commands.join("\n")
    );
  });

  context.subscriptions.push(toggleCmd, startCmd, stopCmd, dictateCmd, helpCmd, statusBar);

  log("VoiceCode activated");
}

export function deactivate() {
  engine?.dispose();
  log("VoiceCode deactivated");
}
