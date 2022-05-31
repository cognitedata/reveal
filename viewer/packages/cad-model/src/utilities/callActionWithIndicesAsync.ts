/*!
 * Copyright 2021 Cognite AS
 */
export async function callActionWithIndicesAsync(
  startIndex: number,
  lastIndexInclusive: number,
  action: (index: number) => any,
  timesPerChunk = 15000
): Promise<void> {
  let index = startIndex;
  return new Promise(resolve => {
    function doChunk() {
      for (let count = 0; count < timesPerChunk && index <= lastIndexInclusive; count++) {
        action(index++);
      }
      if (index <= lastIndexInclusive) {
        setTimeout(doChunk);
      } else {
        resolve();
      }
    }
    doChunk();
  });
}
