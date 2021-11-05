/*!
 * Copyright 2021 Cognite AS
 */
export function* groupMeshesByNumber(id: Float64Array): Generator<{ id: number; meshIndices: number[] }> {
  const groupedByFileId = new Array<{ fileId: number; index: number }>(id.length);
  for (let i = 0; i < id.length; ++i) {
    groupedByFileId[i] = { fileId: id[i], index: i };
  }
  groupedByFileId.sort((a, b) => a.fileId - b.fileId);

  let i = 0;
  while (i < groupedByFileId.length) {
    const fileId = groupedByFileId[i].fileId;
    // Determine sequence of occurences with same fileId
    const last = lastIndexOf(groupedByFileId, fileId, i, x => x.fileId);
    const meshIndices = new Array<number>(last + 1 - i);
    for (let j = i; j < last + 1; j++) {
      meshIndices[j - i] = groupedByFileId[j].index;
    }
    yield { id: fileId, meshIndices };
    // Skip to next group
    i = last + 1;
  }
}

export function lastIndexOf<T>(
  sortedArray: T[],
  value: number,
  firstSearchIndex: number,
  elementValueOf: (element: T) => number
): number {
  let low = firstSearchIndex;
  let high = sortedArray.length - 1;
  let res = sortedArray.length;
  // Binary search to find last matching element
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const elementValue = elementValueOf(sortedArray[mid]);

    if (elementValue > value) {
      high = mid - 1;
    } else if (elementValue < value) {
      low = mid + 1;
    }
    // If arr[mid] is same as x, we
    // update res and move to the right
    // half.
    else {
      res = mid;
      low = mid + 1;
    }
  }
  return res;
}
