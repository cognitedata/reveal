import { useMemo } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@cognite/data-exploration';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import FileTooltip from '../components/ContextualTooltips/FileTooltip/FileTooltip';
import { ANNOTATION_TOOLTIP_POSITION } from '../constants';
import { OnAddContainerReferences } from '../IndustryCanvasPage';
import { TooltipContainer } from '../TooltipContainer';
import { ContainerReferenceType } from '../types';

type UseFileLinkTooltipsParams = {
  annotations: ExtendedAnnotation[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  onAddContainerReferences: OnAddContainerReferences;
};

const useIndustryCanvasFileLinkTooltips = ({
  annotations,
  selectedAnnotation,
  onAddContainerReferences,
}: UseFileLinkTooltipsParams) => {
  return useMemo(() => {
    if (selectedAnnotation === undefined) {
      return [];
    }

    if (annotations.length === 0) {
      return [];
    }

    if (getResourceTypeFromExtendedAnnotation(selectedAnnotation) !== 'file') {
      return [];
    }

    // Filter out self-referential file links, that's not a case for the multi-file viewer
    if (
      getResourceIdFromExtendedAnnotation(selectedAnnotation) ===
      getFileIdFromExtendedAnnotation(selectedAnnotation)
    ) {
      return [
        {
          targetId: String(selectedAnnotation.id),
          content: (
            <TooltipContainer>
              This annotation links to the current file.
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_CENTER,
        },
      ];
    }

    const resourceId = getResourceIdFromExtendedAnnotation(selectedAnnotation);

    if (resourceId === undefined) {
      return [];
    }

    const onAddFileClick = () => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.FILE,
          resourceId: resourceId,
          page: 1,
        },
      ]);
    };

    const onViewClick = () => {
      window.open(createLink(`/explore/files/${resourceId}`), '_blank');
    };

    return [
      {
        targetId: String(selectedAnnotation.id),
        content: (
          <FileTooltip
            id={resourceId}
            onAddFileClick={onAddFileClick}
            onViewClick={onViewClick}
          />
        ),
        anchorTo: ANNOTATION_TOOLTIP_POSITION,
        shouldPositionStrictly: true,
      },
    ];
  }, [annotations, selectedAnnotation, onAddContainerReferences]);
};

export default useIndustryCanvasFileLinkTooltips;
