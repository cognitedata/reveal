export const splitLimitIntoChunks = (
  total: number,
  chunkSize: number
): number[] => {
  const chunkCount = Math.floor(total / chunkSize);
  const chunks = Array(chunkCount).fill(chunkSize);

  if (total % chunkSize) {
    chunks.push(total % chunkSize);
  }

  return chunks;
};
