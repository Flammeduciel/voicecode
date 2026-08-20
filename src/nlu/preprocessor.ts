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
  // Verbs
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
  selection: "selection",
  // Nouns
  fichier: "file", ligne: "line", mot: "word",
  fonction: "function", classe: "class",
  commentaire: "comment", test: "tests",
  terminal: "terminal", fenetre: "window",
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
