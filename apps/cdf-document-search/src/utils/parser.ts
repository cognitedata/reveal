export const parseArrayBufferToBase64 = (
  data?: ArrayBuffer
): string | undefined => {
  if (!data) return undefined;

  let str = '';
  const bytes = new Uint8Array(data);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  return btoa(str);
};
