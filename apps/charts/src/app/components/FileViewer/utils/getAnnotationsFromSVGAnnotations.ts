import { Annotation } from '@cognite/unified-file-viewer';

export const getAnnotationsFromSVGAnnotations = (
  svgAnnotations: Annotation[],
  containerId: string
) =>
  svgAnnotations.map((annotation) => ({
    ...annotation,
    containerId,
  }));
