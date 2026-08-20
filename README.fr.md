<div align="center">

# VoiceCode

### Codez avec votre voix. 80+ commandes. Francais et Anglais.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.95+-007ACC.svg)](https://code.visualstudio.com/)
[![Tests](https://img.shields.io/badge/tests-49%20passing-brightgreen)]()
[![Platform](https://img.shields.io/badge/platform-Windows-blue)]()

</div>

---

## Qu'est-ce que VoiceCode ?

VoiceCode est une **extension VS Code** qui vous permet d'ecrire du code entierement par la voix. Prononcez vos commandes en **francais ou en anglais**, et VoiceCode les comprend et les execute instantanement.

- **80+ commandes vocales** — navigation, edition, git, debug, signets, et plus
- **Bilingue** — parlez francais ou anglais, VoiceCode comprend les deux
- **Execution instantanee** — les commandes s'appliquent des leur reconnaissance
- **Correspondance floue** — gere les pluriels, fautes de frappe et variations proches
- **Mode dictee** — dictez du code librement avec ponctuation automatique

La reconnaissance vocale fonctionne dans **Chrome** via l'API Web Speech, offrant une transcription de qualite Google gratuitement.

---

## Comment ca marche

```
Vous parlez → Chrome reconnaît → WebSocket → NLU interprete → VS Code execute
```

1. **Appuyez sur `Ctrl+Shift+V`** pour commencer a ecouter
2. **Chrome s'ouvre** avec une page de reconnaissance vocale
3. **Prononcez une commande** comme `"supprime la ligne 15"` ou `"annule"`
4. **VoiceCode l'execute** dans votre editeur instantanement

| Composant | Technologie |
|-----------|------------|
| Reconnaissance vocale | Chrome Web Speech API (Google) |
| Communication | WebSocket (localhost) |
| NLU | Regex + Levenshtein (correspondance floue) |
| Execution | VS Code Editor API |

---

## Demarrage rapide

### 1. Installer les dependances

```bash
npm install
```

### 2. Compiler

```bash
npm run build
```

### 3. Lancer dans VS Code

1. Ouvrez ce projet dans VS Code
2. Appuyez sur `F5` pour lancer l'Extension Development Host
3. Dans la nouvelle fenetre VS Code, appuyez sur `Ctrl+Shift+V` pour demarrer
4. Chrome s'ouvre automatiquement — gardez l'onglet ouvert
5. Parlez vos commandes !

---

## Commandes vocales (80+)

### Navigation

| Francais | Anglais | Action |
|----------|---------|--------|
| `"va a la ligne 15"` | `"go to line 15"` | Aller a la ligne 15 |
| `"debut"` / `"fin"` | `"start"` / `"end"` | Aller au debut/fin du fichier |
| `"monte"` / `"descend"` | `"up"` / `"down"` | Deplacer le curseur |
| `"gauche"` / `"droite"` | `"left"` / `"right"` | Deplacer le curseur |
| `"va au mot gauche"` | `"move word left"` | Deplacer d'un mot a gauche |
| `"va a la definition"` | `"go to definition"` | Aller a la definition |
| `"va aux references"` | `"go to references"` | Trouver les references |

### Defilement

| Francais | Anglais | Action |
|----------|---------|--------|
| `"defile haut"` / `"defile bas"` | `"scroll up"` / `"scroll down"` | Defiler ligne par ligne |
| `"page haut"` / `"page bas"` | `"page up"` / `"page down"` | Defiler par pages |

### Edition

| Francais | Anglais | Action |
|----------|---------|--------|
| `"annule"` | `"undo"` | Annuler |
| `"refais"` | `"redo"` | Refaire |
| `"supprime la ligne"` | `"delete line"` | Supprimer la ligne |
| `"supprime le mot"` | `"delete word"` | Supprimer le mot |
| `"duplique la ligne"` | `"duplicate line"` | Dupliquer la ligne |
| `"deplace ligne haut"` | `"move line up"` | Deplacer la ligne vers le haut |
| `"joindre lignes"` | `"join lines"` | Joindre avec la ligne suivante |
| `"trier lignes"` | `"sort lines"` | Trier les lignes |
| `"majuscule"` / `"minuscule"` | `"uppercase"` / `"lowercase"` | Changer la casse |
| `"copie"` / `"colle"` / `"coupe"` | `"copy"` / `"paste"` / `"cut"` | Presse-papiers |
| `"indente"` / `"deindente"` | `"indent"` / `"outdent"` | Indenter |

### Selection et multi-curseur

| Francais | Anglais | Action |
|----------|---------|--------|
| `"selectionne tout"` | `"select all"` | Selectionner tout |
| `"selectionne la ligne"` | `"select line"` | Selectionner la ligne |
| `"selectionne le mot"` | `"select word"` | Selectionner le mot |
| `"ajoute curseur dessus"` | `"add cursor above"` | Ajouter un curseur au-dessus |
| `"ajoute curseur dessous"` | `"add cursor below"` | Ajouter un curseur en dessous |
| `"selectionne suivante"` | `"select next occurrence"` | Selectionner la prochaine occurrence |

### Commentaires et pliage

| Francais | Anglais | Action |
|----------|---------|--------|
| `"commente la ligne"` | `"toggle comment"` | Commenter/decommenter |
| `"commente en bloc"` | `"block comment"` | Commentaire en bloc |
| `"plie"` / `"deplie"` | `"fold"` / `"unfold"` | Plier/deplier le code |
| `"plie tout"` / `"deplie tout"` | `"fold all"` / `"unfold all"` | Plier/deplier tout |

### Recherche et remplacement

| Francais | Anglais | Action |
|----------|---------|--------|
| `"cherche HelloWorld"` | `"find HelloWorld"` | Rechercher dans le fichier |
| `"remplace foo par bar"` | `"replace foo with bar"` | Remplacer |
| `"cherche suivant"` | `"find next"` | Resultat suivant |
| `"remplace tout"` | `"replace all"` | Tout remplacer |

### Onglets et editeurs

| Francais | Anglais | Action |
|----------|---------|--------|
| `"suivant"` / `"precedent"` | `"next tab"` / `"previous tab"` | Changer d'onglet |
| `"ferme tout"` | `"close all tabs"` | Fermer tous les onglets |
| `"reouvre l'onglet"` | `"reopen tab"` | Rouvrir l'onglet ferme |
| `"divise l'editeur"` | `"split editor"` | Diviser l'editeur |

### Fichiers et terminal

| Francais | Anglais | Action |
|----------|---------|--------|
| `"sauvegarde"` / `"sauve tout"` | `"save"` / `"save all"` | Sauvegarder |
| `"nouveau fichier"` | `"new file"` | Creer un fichier |
| `"ouvre le terminal"` | `"open terminal"` | Ouvrir le terminal |
| `"efface terminal"` | `"clear terminal"` | Effacer le terminal |
| `"lance les tests"` | `"run tests"` | Lancer les tests |
| `"compile"` | `"build"` | Compiler |
| `"formate"` | `"formater"` | Formater le document |

### Interface et panneaux

| Francais | Anglais | Action |
|----------|---------|--------|
| `"montre barre laterale"` | `"toggle sidebar"` | Afficher/masquer la barre laterale |
| `"montre le panneau"` | `"toggle panel"` | Afficher/masquer le panneau |
| `"explorateur"` | `"toggle explorer"` | Basculer l'explorateur |
| `"zoom"` / `"dezoom"` | `"zoom in"` / `"zoom out"` | Zoomer/dezoomer |
| `"parametres"` | `"open settings"` | Ouvrir les parametres |
| `"extensions"` | `"open extensions"` | Ouvrir les extensions |

### Git

| Francais | Anglais | Action |
|----------|---------|--------|
| `"git commit"` | `"git commit"` | Valider les changements |
| `"git push"` | `"git push"` | Pousser vers le remote |
| `"git pull"` | `"git pull"` | Tirer depuis le remote |
| `"git statut"` | `"git status"` | Afficher le statut git |
| `"git diff"` | `"git diff"` | Afficher le diff |
| `"git journal"` | `"git log"` | Afficher l'historique |

### Debug

| Francais | Anglais | Action |
|----------|---------|--------|
| `"demarre le debug"` | `"start debugging"` | Demarrer le debug |
| `"arrete le debug"` | `"stop debugging"` | Arreter le debug |
| `"palier dessus"` | `"step over"` | Passer au-dessus |
| `"palier dessous"` | `"step into"` | Entrer dans |
| `"palier sortir"` | `"step out"` | Sortir de |
| `"continue"` | `"continue"` | Continuer |
| `"ajoute breakpoint"` | `"toggle breakpoint"` | Ajouter/supprimer un breakpoint |

### Refactorisation

| Francais | Anglais | Action |
|----------|---------|--------|
| `"renomme le symbole"` | `"rename symbol"` | Renommer le symbole |
| `"correction rapide"` | `"quick fix"` | Correction rapide |
| `"refactorise"` | `"refactor"` | Refactoriser |

### Signets

| Francais | Anglais | Action |
|----------|---------|--------|
| `"ajoute signet"` | `"toggle bookmark"` | Ajouter/retirer un signet |
| `"signet suivant"` | `"next bookmark"` | Signet suivant |
| `"signet precedent"` | `"previous bookmark"` | Signet precedent |

### Mode dictee

Dites **"dicte"** pour entrer en mode dictee. Tout ce que vous dites est insere comme texte dans l'editeur. Dites **"arrete la dictee"** pour sortir.

| Vous dites | Vous obtenez |
|------------|-------------|
| `"dicte"` | Active le mode dictee |
| `"arrete la dictee"` | Desactive le mode dictee |
| `"console.log parenthese ouvrante hello parenthese fermante"` | `console.log(hello)` |
| `"let x egal semicolon"` | `let x egal;` |

Les mots de ponctuation sont convertis en caracteres :

| Vous dites | Vous obtenez |
|------------|-------------|
| `"point"` | `.` |
| `"virgule"` | `,` |
| `"point virgule"` | `;` |
| `"deux points"` | `:` |
| `"parenthese ouvrante"` | `(` |
| `"parenthese fermante"` | `)` |
| `"accolade ouvrante"` | `{` |
| `"accolade fermante"` | `}` |
| `"nouvelle ligne"` | retour a la ligne |

### Correspondance floue

VoiceCode gere les **pluriels** et les **variations proches** :

| Vous dites | Reconnu comme |
|------------|---------------|
| `"selectionne les lignes"` | `"selectionne la ligne"` |
| `"ferme les onglets"` | `"ferme l'onglet"` |
| `"supprime les mots"` | `"supprime le mot"` |
| `"annulez"` | `"annule"` |
| `"sauvegardez"` | `"sauvegarde"` |

---

## Configuration

Ouvrez les parametres VS Code (`Ctrl+,`) et cherchez **VoiceCode** :

| Parametre | Par defaut | Description |
|-----------|-----------|-------------|
| `voicecode.language` | `"fr"` | Langue de reconnaissance (`en`, `fr`) |
| `action.enableNotifications` | `true` | Afficher les notifications VS Code |

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Shift+V` | Activer/desactiver l'enregistrement |

---

## Architecture

```
voicecode/
├── src/
│   ├── extension.ts           # Point d'entree de l'extension
│   ├── engine.ts              # Moteur d'orchestration principal
│   ├── state-machine.ts       # idle → recording
│   ├── config.ts              # Lecture des parametres VS Code
│   │
│   ├── stt/
│   │   └── speech-server.ts   # Serveur HTTP + WebSocket + page Chrome
│   │
│   ├── nlu/
│   │   ├── orchestrator.ts    # Achemine le texte via les couches NLU
│   │   ├── preprocessor.ts    # Nettoie le texte, FR→EN, normalisation
│   │   ├── patterns.ts        # 80+ patterns regex (FR/EN)
│   │   ├── fast-path.ts       # Correspondance floue Levenshtein (120+ commandes)
│   │   ├── intents.ts         # Definitions des intents (80+ intents)
│   │   ├── entities.ts        # Extraction d'entites + traitement texte dicte
│   │   └── numbers.ts         # "quinze" → 15 (FR/EN)
│   │
│   ├── editor/
│   │   ├── actions.ts         # Actions VS Code (80+ commandes)
│   │   └── context.ts         # Etat de l'editeur (curseur, selection)
│   │
│   └── ui/
│       └── status-bar.ts      # Indicateur d'etat d'enregistrement
│
├── test/                      # 49 tests unitaires
└── dist/                      # Extension compilee
```

### Flux de donnees

```
Reconnaissance vocale Chrome (Web Speech API)
    │  Transcription de qualite Google en FR/EN
    ▼
WebSocket (localhost)
    │  Streaming en temps reel des transcriptions
    ▼
Preprocesseur
    │  Suppression des hesitations, normalisation des accents, FR→EN
    ▼
Pipeline NLU (< 1ms)
    │  Patterns regex → Correspondance floue Levenshtein
    ▼
Mode dictée ?
    │  Oui → Insertion directe du texte (ponctuation convertie)
    │  Non → VS Code Action (navigation, edition, git, debug, etc.)
    ▼
Retour (notification + feed Chrome)
```

---

## Stack technique

| Composant | Choix | Pourquoi |
|-----------|-------|----------|
| Langage | TypeScript | Natif VS Code, securite de type |
| Reconnaissance vocale | Chrome Web Speech API | Qualite Google, gratuit, sans configuration |
| Communication | WebSocket (ws) | Streaming localhost en temps reel |
| NLU | Regex + Levenshtein | < 1ms de latence, sans modele |
| Compilation | esbuild | Compilation rapide, compatible VS Code |
| Tests | Vitest | Rapide, natif TypeScript |

---

## Developpement

### Pre-requis

- Node.js 20+
- VS Code 1.95+
- Google Chrome (pour la reconnaissance vocale)
- Windows (cible principale)

### Commandes

```bash
# Installer les dependances
npm install

# Lancer les tests
npm test

# Compiler pour la production
npm run build

# Mode surveillance (recompilation automatique)
npm run watch
```

### Lancer en developpement

1. Ouvrez le projet dans VS Code
2. Appuyez sur `F5` pour lancer l'Extension Development Host
3. L'extension s'active automatiquement
4. Appuyez sur `Ctrl+Shift+V` pour demarrer l'enregistrement
5. Chrome s'ouvre avec la page de reconnaissance vocale
6. Parlez vos commandes !

---

## Feuille de route

- [x] Integration Chrome Web Speech API
- [x] Serveur WebSocket pour transcriptions en temps reel
- [x] Pipeline NLU (80+ commandes FR/EN)
- [x] Correspondance floue avec normalisation des pluriels
- [x] Execution instantanee des commandes
- [x] Barre d'etat avec etat d'enregistrement
- [x] Commandes git (commit, push, pull, diff, log)
- [x] Commandes debug (demarrer, arreter, palier, breakpoint)
- [x] Gestion des signets
- [x] Support multi-curseur
- [x] Pliage de code
- [x] Mode dictee (dicteez du code par la voix)
- [ ] Detection d'activite vocale (demarrage/arret auto)
- [ ] Definitions de commandes personnalisees
- [ ] Support multi-moniteurs
- [ ] Support SSH distant

---

## Licence

MIT

---

<div align="center">

**Construit avec soin. Votre code reste sur votre machine.**

</div>
