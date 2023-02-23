export function stringSorter<T extends Record<string, any>>(
  strA: T,
  strB: T,
  columnKey: keyof T
) {
  const a = strA[columnKey];
  const b = strB[columnKey];
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  } else if (b.toLowerCase() > a.toLowerCase()) {
    return 1;
  } else {
    return 0;
  }
}
