// use to sort an array with .sort fn in the order like: '1', '2', '11', 'A', 'a', 'B', 'b'
export function sortNaturally(a: string, b: string) {
  // kf-upper means "A" goes before "a", kn-true means sort numbers by value i.e. "1", "2", "11"
  return a.localeCompare(b, 'en-US-u-kf-upper-kn-true');
}
