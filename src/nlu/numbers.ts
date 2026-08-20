const FRENCH_NUMBERS: Record<string, number> = {
  zero: 0, zéro: 0,
  un: 1, une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  dixsept: 17, "dix-sept": 17,
  dixhuit: 18, "dix-huit": 18,
  dixneuf: 19, "dix-neuf": 19,
  vingt: 20,
  trente: 30,
  quarante: 40,
  cinquante: 50,
  soixante: 60,
  cent: 100,
};

const ENGLISH_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1, won: 1,
  two: 2, to: 2, too: 2,
  three: 3,
  four: 4, for: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8, ate: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  hundred: 100,
};

export function parseSpokenNumber(text: string): number | null {
  const cleaned = text.toLowerCase().trim();

  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  if (FRENCH_NUMBERS[cleaned] !== undefined) {
    return FRENCH_NUMBERS[cleaned];
  }

  if (ENGLISH_NUMBERS[cleaned] !== undefined) {
    return ENGLISH_NUMBERS[cleaned];
  }

  return null;
}
