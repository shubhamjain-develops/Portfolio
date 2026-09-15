/** Keeps "ab"+"c" and "a"+"bc" apart. A control character never appears in content. */
const SEPARATOR = String.fromCharCode(31);

/**
 * A decorative, stable 7-character "commit hash" for the Experience git-log
 * view. FNV-1a over the entry's own words, so the same role always gets the
 * same hash and nothing random differs between the server and the browser.
 */
export function commitHash(...parts: string[]): string {
  let hash = 0x811c9dc5;
  for (const char of parts.join(SEPARATOR)) {
    hash = Math.imul(hash ^ char.codePointAt(0)!, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0").slice(0, 7);
}
