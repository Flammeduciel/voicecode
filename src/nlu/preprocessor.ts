const FILLER_WORDS = new Set([
  // French
  "euh", "bah", "genre", "quoi", "enfin", "hein", "bon", "du coup", " voilà",
  "là", "alors", "donc", "okay", "ok",
  // English
  "um", "uh", "like", "you know", "so", "well", "okay", "ok", "right",
]);

const FRENCH_TO_ENGLISH: Record<string, string> = {
  // Articles / prepositions
  la: "the", le: "the", les: "the", un: "a", une: "a",
  au: "to", a: "to", aux: "to",
  // Prepositions / conjunctions
  par: "with", pour: "for", dans: "in", sur: "on", de: "of", du: "of",
  et: "and", ou: "or", mais: "but", si: "if",
  // Verbs - core
  creer: "create", cree: "create", creez: "create",
  supprimer: "delete", supprime: "delete", efface: "delete",
  ouvrir: "open", ouvre: "open",
  sauvegarder: "save", sauvegarde: "save", sauve: "save",
  fermer: "close", ferme: "close",
  executer: "run", execute: "run", lance: "run",
  annuler: "undo", annule: "undo",
  refaire: "redo", refais: "redo",
  remplacer: "replace", remplace: "replace",
  copier: "copy", copie: "copy",
  coller: "paste", colle: "paste",
  couper: "cut", coupe: "cut",
  chercher: "find", cherche: "find",
  recherche: "find",
  formatter: "format", formate: "format",
  indenter: "indent", indente: "indent",
  commenter: "comment", commente: "comment",
  dupliquer: "duplicate", duplique: "duplicate",
  // Navigation verbs
  va: "go", vas: "go",
  // Direction nouns
  debut: "start", fin: "end",
  haut: "up", bas: "down",
  gauche: "left", droite: "right",
  nouvelle: "new", nouveau: "new",
  selectionne: "select",
  // Nouns - core
  fichier: "file", ligne: "line", mot: "word",
  fonction: "function", classe: "class",
  commentaire: "comment", test: "tests",
  terminal: "terminal", fenetre: "window",
  // Scroll
  defiler: "scroll", defile: "scroll",
  page: "page",
  // Fold/Unfold
  plier: "fold", plie: "fold", deplier: "unfold", deplie: "unfold",
  // Tabs
  onglet: "tab", onglets: "tabs",
  prochain: "next", precedent: "previous",
  epingler: "pin", epingle: "pin",
  reouvrir: "reopen", reouvre: "reopen",
  tous: "all", tout: "all",
  // Editors
  editeur: "editor", editeurs: "editors",
  diviser: "split", divise: "split",
  // Multi-cursor
  curseur: "cursor",
  occurrence: "occurrence", suivante: "next",
  // Line operations
  remonter: "move up", descendre: "move down",
  joindre: "join", fusionner: "join",
  trier: "sort", trie: "sort",
  majuscule: "uppercase", minuscule: "lowercase",
  espaces: "whitespace",
  // Go to
  definition: "definition",
  references: "references",
  implementations: "implementation",
  apercu: "peek",
  // Refactor
  symbole: "symbol",
  renommer: "rename", renomme: "rename",
  corriger: "fix", corrige: "fix",
  refactoriser: "refactor", refactorise: "refactor",
  // Debug
  deboguer: "debug", debogue: "debug",
  arreter: "stop", arrete: "stop",
  continuer: "continue",
  palier: "step", pas: "step",
  dessus: "over", dessous: "into",
  sortir: "out",
  breakpoint: "breakpoint", pause: "breakpoint",
  // Git
  git: "git", depot: "repository",
  commit: "commit", pousser: "push", tirer: "pull",
  statut: "status", journal: "log",
  // Bookmarks
  signet: "bookmark", signets: "bookmarks",
  marqueur: "bookmark", marqueurs: "bookmarks",
  // UI
  barre: "bar", laterale: "sidebar", activite: "activity",
  panneau: "panel", explorateur: "explorer",
  parametres: "settings", preferences: "settings",
  extensions: "extensions",
  recent: "recent",
  // Zoom
  zoomer: "zoom in", dezoomer: "zoom out",
  reinitialiser: "reset",
  // Dictation
  dicter: "dictate", dicte: "dictate",
  parler: "speak", parle: "speak",
  ecrire: "type", ecrit: "type",
};

function normalizeAccents(str: string): string {
  const map: Record<string, string> = {
    à: "a", â: "a", ä: "a",
    é: "e", è: "e", ê: "e", ë: "e",
    î: "i", ï: "i",
    ô: "o", ö: "o",
    ù: "u", û: "u", ü: "u",
    ÿ: "y",
    ç: "c",
    œ: "oe", æ: "ae",
  };
  return str.replace(/[àâäéèêëïîôùûüÿçœæ]/g, (ch) => map[ch] ?? ch);
}

export function preprocessText(raw: string): string {
  let text = raw.toLowerCase().trim();

  text = normalizeAccents(text);

  text = text
    .replace(/[^\w\s\d]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text.split(" ");
  const cleaned: string[] = [];

  for (const word of words) {
    if (FILLER_WORDS.has(word)) {
      continue;
    }
    cleaned.push(word);
  }

  text = cleaned.join(" ");

  for (const [fr, en] of Object.entries(FRENCH_TO_ENGLISH)) {
    const regex = new RegExp(`\\b${fr}\\b`, "gi");
    text = text.replace(regex, en);
  }

  return text.trim();
}
