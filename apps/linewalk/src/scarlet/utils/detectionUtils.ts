import { Detection } from 'scarlet/types';

export const isSameDetection = (a: Detection, b: Detection) =>
  a.documentExternalId === b.documentExternalId &&
  a.pageNumber === b.pageNumber &&
  a.boundingBox.x === b.boundingBox.x &&
  a.boundingBox.y === b.boundingBox.y &&
  a.boundingBox.width === b.boundingBox.width &&
  a.boundingBox.height === b.boundingBox.height;
