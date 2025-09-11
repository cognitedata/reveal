export const revokeObjectUrl = (url: string): void => {
  if (typeof url === 'string') {
    globalThis.URL.revokeObjectURL(url);
  }
};
