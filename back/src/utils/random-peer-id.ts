function randomLetter(): string {
  return 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
}

function randomNumber(): string {
  return '0123456789'[Math.floor(Math.random() * 10)];
}

function randomChar(): string {
  return Math.random() < 0.5 ? randomLetter() : randomNumber();
}

/**
 * Generates a random 40 character alpha-numeric string to be used as a Peer JS
 * ID.
 *
 * The generated ID is not checked for uniqueness.
 */
export function randomPeerId(): string {
  let out: string = '';

  for (let i = 0; i < 40; ++i) {
    out += randomChar();
  }

  return out;
}
