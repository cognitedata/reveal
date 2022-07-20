import { AnnotatorRegion } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
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
    let { x, y, w, h } = region;

    if (x >= 1 || y >= 1) {
      // error state but not handling here
      return region;
    }

    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }

    if (x + w > 1) {
      w = 1 - x;
    }
    if (y + h > 1) {
      h = 1 - y;
    }
    return { ...region, x, y, w, h };
  }
  return region;
};
