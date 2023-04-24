import { ExtendedAnnotation } from '@data-exploration-lib/core';

const getIntersectionOverUnion = (
  annotation1: ExtendedAnnotation,
  annotation2: ExtendedAnnotation
): number => {
  const { x: x1, y: y1, width: width1, height: height1 } = annotation1;
  const { x: x2, y: y2, width: width2, height: height2 } = annotation2;

  const xLeft = Math.max(x1, x2);
  const yTop = Math.max(y1, y2);
  const xRight = Math.min(x1 + width1, x2 + width2);
  const yBottom = Math.min(y1 + height1, y2 + height2);

  if (xRight < xLeft || yBottom < yTop) {
    return 0;
  }

  const intersectionArea = (xRight - xLeft) * (yBottom - yTop);
  const unionArea = width1 * height1 + width2 * height2 - intersectionArea;

  return intersectionArea / unionArea;
};

type Props = {
  selectedAnnotation: ExtendedAnnotation;
  annotations: ExtendedAnnotation[];
  overlapThreshold: number;
};

// Will return all the annotations that overlap with the selected annotation,
// expect the selected annotation itself.
export const getOverlappingAnnotations = ({
  selectedAnnotation,
  annotations,
  overlapThreshold: iouThreshold,
}: Props): ExtendedAnnotation[] => {
  return annotations
    .map((annotation) => ({
      annotation,
      iou: getIntersectionOverUnion(selectedAnnotation, annotation),
    }))
    .filter(
      ({ annotation, iou }) =>
        iou > iouThreshold && annotation.id !== selectedAnnotation.id
    )
    .map(({ annotation }) => annotation);
};
