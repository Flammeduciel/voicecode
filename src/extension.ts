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

  const helpCmd = vscode.commands.registerCommand("voicecode.showCommands", () => {
    const commands = [
      "Navigation: 'va a la ligne 15', 'go to start', 'monte', 'descend'",
      "Editing: 'annule', 'refais', 'supprime la ligne', 'copie', 'colle'",
      "Files: 'sauvegarde', 'ferme l'onglet', 'nouveau fichier'",
      "Terminal: 'ouvre le terminal', 'lance les tests', 'compile'",
      "Replace: 'remplace foo par bar'",
      "Punctuation: 'point', 'virgule', 'point virgule'",
    ];
    vscode.window.showInformationMessage(
      "VoiceCode Commands:\n" + commands.join("\n")
    );
  });

  context.subscriptions.push(toggleCmd, startCmd, stopCmd, helpCmd, statusBar);

  log("VoiceCode activated");
}

export function deactivate() {
  engine?.dispose();
  log("VoiceCode deactivated");
}
