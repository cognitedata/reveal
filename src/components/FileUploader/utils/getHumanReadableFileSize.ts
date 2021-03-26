/**
 * @param sizeInBytes
 * @param precision
 * @returns the most suitable size string
 * @example
 *  getHumanReadableFileSize(1) // returns "1 B"
 *  getHumanReadableFileSize(1024) // returns "1 kB"
 *  getHumanReadableFileSize(999 * 1024 ** 2) // returns "999 MB"
 *  getHumanReadableFileSize(10 * 1024 ** 3) // returns "10 GB"
 */
export function getHumanReadableFileSize(
  sizeInBytes: number,
  precision = 2
): string {
  if (sizeInBytes === 0) {
    return `0 B`;
  }
  if (sizeInBytes < 1) {
    return `${sizeInBytes.toPrecision(precision)} B`;
  }
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${Number((sizeInBytes / 1024 ** i).toFixed(precision))} ${
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  }`;
}
