export function hash(s) {
  let h = 9;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 9 ** 9);
  }
  return (h ^ (h >>> 9)).toString(16);
}
