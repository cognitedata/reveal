export function removeIllegalCharacters(string: string) {
  return string.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
