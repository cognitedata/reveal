export function toDisplayDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
export function toDisplayDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
