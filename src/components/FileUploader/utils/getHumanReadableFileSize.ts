/**
 * @param sizeInBytes
 * @returns the most suitable size string
 * @example
 *  getHumanReadableFileSize(1) // returns "1 Byte"
 *  getHumanReadableFileSize(1024) // returns "1 KB"
 *  getHumanReadableFileSize(999 * 1024 ** 2) // returns "999 MB"
 *  getHumanReadableFileSize(10 * 1024 ** 3) // returns "10 GB"
 */
export function getHumanReadableFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1) {
    return `${sizeInBytes.toPrecision(2)} B`;
  }
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
  return `${Number((sizeInBytes / 1024 ** i).toFixed(2))} ${
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  }`;
}
