import { AnnotationBoundingBox } from '@cognite/annotations';

export const PNID_ANNOTATION_TYPE = 'pnid_annotation';

export const isSimilarBoundingBox = (
  origBox: AnnotationBoundingBox,
  compBox: AnnotationBoundingBox,
  percentDiff = 0.1,
  smallerOnly = false
) => {
  const { xMax, xMin, yMax, yMin } = origBox;
  // check right
  if (
    compBox.xMax <= (smallerOnly ? xMax : xMax * (1 + percentDiff)) &&
    compBox.xMax >= xMax * (1 - percentDiff)
  ) {
    // check bottom
    if (
      compBox.yMax <= (smallerOnly ? yMax : yMax * (1 + percentDiff)) &&
      compBox.yMax >= yMax * (1 - percentDiff)
    ) {
      // check left
      if (
        compBox.xMin >= (smallerOnly ? xMin : xMin * (1 - percentDiff)) &&
        compBox.xMin <= xMin * (1 + percentDiff)
      ) {
        // check top
        if (
          compBox.yMin >= (smallerOnly ? yMin : yMin * (1 - percentDiff)) &&
          compBox.yMin <= yMin * (1 + percentDiff)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

type T = { box: AnnotationBoundingBox };
export const removeSimilarAnnotations = (
  el: T,
  index: number,
  allAnnotations: T[]
) => {
  return !allAnnotations.some(
    (anno, otherIndex) =>
      index < otherIndex &&
      (isSimilarBoundingBox(anno.box, el.box, 0.5, true) ||
        isSimilarBoundingBox(anno.box, el.box, 0.1, false))
  );
};
