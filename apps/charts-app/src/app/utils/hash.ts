/* eslint-disable no-bitwise */
export function getHash(input: string | object) {
  let serializedInput;

  if (typeof input !== 'string') {
    serializedInput = JSON.stringify(input);
  } else {
    serializedInput = input;
  }

  let hash = 0;
  if (serializedInput.length === 0) {
    return hash;
  }
  for (let i = 0; i < serializedInput.length; i++) {
    const char = serializedInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}
