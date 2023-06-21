export function generateFakeDataSource(numRows: number) {
  return [...new Array(numRows)].map((_, i) => ({
    key: 1000 + i,
    value: `Test #${i}`,
  }));
}
