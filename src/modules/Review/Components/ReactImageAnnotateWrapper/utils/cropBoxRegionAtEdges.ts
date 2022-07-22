import { AnnotatorRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';

export const cropEdge = (
  start: number,
  length: number
): { start: number; length: number } => {
  if (start > 1) {
    return { start, length };
  }

  if (start > 0) {
    if (start + length > 1) {
      return { start, length: 1 - start };
    }
    return { start, length };
  }

  // if (start < 0)
  if (start + length < 0) {
    return { start, length };
  }
  if (start + length < 1) {
    return { start: 0, length: start + length };
  }
  return { start: 0, length: 1 };
};

/**
 * @param region AnnotatorRegion
 * @returns AnnotatorRegion
 * function will not handle any case if x or y is grater than 1
 * error will capture at the API request
 */
export const cropBoxRegionAtEdges = (
  region: AnnotatorRegion
): AnnotatorRegion => {
  if (region.type === 'box') {
    const { x, y, w, h } = region;

    const { start: startX, length: lengthW } = cropEdge(x, w);
    const { start: startY, length: lengthH } = cropEdge(y, h);

    return { ...region, x: startX, y: startY, w: lengthW, h: lengthH };
  }
  return region;
};
