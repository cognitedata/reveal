import { Colors } from '@cognite/cogs.js';
import { Annotation, AnnotationType } from '@cognite/unified-file-viewer';
import { isSuggestedAnnotation } from './migration/utils';
import { ExtendedAnnotation } from './types';

const getExtendedAnnotationsWithBadges = (
  annotations: ExtendedAnnotation[]
): Annotation[] => {
  return annotations.flatMap(annotation =>
    isSuggestedAnnotation(annotation)
      ? [
          annotation,
          {
            containerId: annotation.containerId,
            id: `${annotation.id}-suggested`,
            radius: 0.003,
            style: {
              fill: Colors['decorative--red--400'].hex(),
              stroke: Colors['decorative--red--400'].hex(),
              strokeWidth: 5,
            },
            type: AnnotationType.ELLIPSE,
            x: annotation.x + annotation.width,
            y: annotation.y,
            metadata: undefined,
          },
        ]
      : [annotation]
  );
};

export default getExtendedAnnotationsWithBadges;
