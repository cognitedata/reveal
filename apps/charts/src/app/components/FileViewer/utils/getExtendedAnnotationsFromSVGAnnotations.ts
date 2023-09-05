import chroma from 'chroma-js';

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
  svgAnnotations.map((annotation) => {
    const style = getDefaultStylesByResourceType('asset');
    const fill = chroma(style.stroke || '#000000')
      .alpha(0.01)
      .css();
    return {
      ...(annotation as RectangleAnnotation),
      containerId,
      // assumption: all the extracted annotations are asset annotations
      style: {
        ...style,
        fill,
      },
      metadata: {
        label: annotation.id,
        resourceType: 'asset',
      },
    };
  });
