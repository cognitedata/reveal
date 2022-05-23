/**
 * Copyright 2022 Cognite AS
 */

export function incrementOrInsertIndex(indexMap: Map<number, number>, index: number): void {
  const count = indexMap.get(index);

  if (count === undefined) {
    indexMap.set(index, 1);
  } else {
    indexMap.set(index, count + 1);
  }
}

export function decrementOrDeleteIndex(indexMap: Map<number, number>, index: number): void {
  const count = indexMap.get(index);

  // Should ideally not happend, but as of now,
  // a sector can potensially be discarded before loaded,
  // which then causes treeIndex to be removed (before it is added)
  if (count === undefined) {
    return;
  }

  if (count <= 1) {
    indexMap.delete(index);
  } else {
    indexMap.set(index, count - 1);
  }
}
