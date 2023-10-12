import { useMemo } from 'react';

import sortBy from 'lodash/sortBy';

import { Button } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { getOverlappingAnnotations } from './getOverlappingAnnotations';
import { getExtendedAnnotationLabel } from './migration';
import { TooltipContainerColumn } from './TooltipContainerColumn';

const useOverlappingAnnotationsTooltips = (
  isEnabled: boolean,
  annotations: ExtendedAnnotation[],
  selectedAnnotations: ExtendedAnnotation[],
  selectAnnotation: (annotation: ExtendedAnnotation) => void
) => {
  return useMemo(() => {
    if (
      !isEnabled ||
      annotations.length === 0 ||
      selectedAnnotations.length !== 1
    ) {
      return [];
    }

    const selectedAnnotation = selectedAnnotations[0];

    const overlappingAnnotations = getOverlappingAnnotations({
      selectedAnnotation,
      annotations,
      overlapThreshold: 0,
    });

    if (overlappingAnnotations.length === 0) {
      return [];
    }

    const annotationsWithLabels = [
      ...overlappingAnnotations,
      selectedAnnotation,
    ].map((annotation) => {
      return {
        annotation,
        label: getExtendedAnnotationLabel(annotation) || 'N/A',
      };
    });

    // We sort the annotation by label to make the list predictable, e.g. we want the list be
    // be in the same order regardless of which of the overlapping annotations you have selected.
    const sortedAnnotations = sortBy(annotationsWithLabels, 'label');

    return [
      {
        targetIds: [String(selectedAnnotation.id)],
        content: (
          <TooltipContainerColumn>
            <div style={{ padding: '8px' }}>Overlapping annotations</div>
            {sortedAnnotations.map(({ annotation, label }) => {
              return (
                <Button
                  type="ghost"
                  size="small"
                  key={annotation.id}
                  toggled={annotation.id === selectedAnnotation.id}
                  onClick={() => selectAnnotation(annotation)}
                >
                  {label}
                </Button>
              );
            })}
          </TooltipContainerColumn>
        ),
        anchorTo: TooltipAnchorPosition.BOTTOM_CENTER,
      },
    ];
  }, [isEnabled, annotations, selectedAnnotations, selectAnnotation]);
};

export default useOverlappingAnnotationsTooltips;
