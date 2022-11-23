import { Colors } from '@cognite/cogs.js';
import { Annotation, AnnotationType } from '@cognite/unified-file-viewer';
import { isSuggestedAnnotation } from './migration/utils';
import { ExtendedAnnotation } from './types';

const getExtendedAnnotationsWithBadges = (
  annotations: ExtendedAnnotation[]
): (ExtendedAnnotation | Annotation)[] => {
  return annotations.flatMap(annotation =>
    isSuggestedAnnotation(annotation)
      ? [
          annotation,
          {
            containerId: annotation.containerId,
            id: `${annotation.id}-suggested`,
            radius: 0.01,
            style: {
              fill: Colors['decorative--red--400'],
              stroke: Colors['decorative--grayscale--100'],
              strokeWidth: 3,
            },
            type: AnnotationType.ELLIPSE,
            x: annotation.x + annotation.width,
            y: annotation.y,
          },
        ]
      : [annotation]
  );
};

export default getExtendedAnnotationsWithBadges;
