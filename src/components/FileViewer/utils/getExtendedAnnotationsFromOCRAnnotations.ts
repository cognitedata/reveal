import {
  getAnnotationsFromContextApiOcrAnnotations,
  OCRAnnotation,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '../types';

export const getExtendedAnnotationsFromOCRAnnotations = (
  filteredOCRAnnotations: OCRAnnotation[],
  containerId: string
): ExtendedAnnotation[] =>
  getAnnotationsFromContextApiOcrAnnotations(
    filteredOCRAnnotations,
    containerId
  ).map((annotation) => ({
    ...(annotation as RectangleAnnotation),
    metadata: {},
  }));
