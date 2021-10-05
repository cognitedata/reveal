export function removeIllegalCharacters(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
