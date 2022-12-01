import {
  Annotation,
  getDefaultStylesByResourceType,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '../types';

export const getExtendedAnnotationsFromSVGAnnotations = (
  svgAnnotations: Annotation[],
  containerId: string
): ExtendedAnnotation[] =>
  svgAnnotations.map((annotation) => ({
    ...(annotation as RectangleAnnotation),
    containerId,
    // assumption: all the extracted annotations are asset annotations
    style: getDefaultStylesByResourceType('asset'),
    metadata: {
      label: annotation.id,
      resourceType: 'asset',
    },
  }));
