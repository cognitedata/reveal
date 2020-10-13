// reveal uses base64 string for screenshot fn,
// but base64 is blocked by CSP (blob should be blocked too though)
export function base64ToBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type: 'image/jpeg' });
}
