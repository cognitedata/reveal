export function sortObjectByNumberValue(
  record: Record<string, number>
): string[] {
  return Object.keys(record).sort((a, b) => {
    const aCount = record[a];
    const bCount = record[b];

    return bCount - aCount;
  });
}
