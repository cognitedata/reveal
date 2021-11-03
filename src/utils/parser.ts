export const parseArrayBufferToBase64 = (
  data?: ArrayBuffer
): string | undefined => {
  if (!data) return undefined;

  const arrayBufferView = new Uint8Array(data);

  return btoa(String.fromCharCode.apply(null, arrayBufferView as any));
};
