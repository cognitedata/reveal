import { Button } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import {
  getFileIdFromExtendedAnnotation,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@cognite/data-exploration';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import { TooltipContainer } from '../TooltipContainer';
import { ContainerReference, ContainerReferenceType } from '../types';
import { OnAddContainerReferences } from './useIndustryCanvasAddContainerReferences';

type UseFileLinkTooltipsParams = {
  annotations: ExtendedAnnotation[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  onAddContainerReferences: OnAddContainerReferences;
  containerReferences: ContainerReference[];
};

const useIndustryCanvasFileLinkTooltips = ({
  annotations,
  selectedAnnotation,
  onAddContainerReferences,
  containerReferences,
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

    const additionalFileId =
      getResourceExternalIdFromExtendedAnnotation(selectedAnnotation) ??
      getResourceIdFromExtendedAnnotation(selectedAnnotation);

    if (
      containerReferences.some(
        (containerReference) => containerReference.id === additionalFileId
      )
    ) {
      return [];
    }

    return [
      {
        targetId: String(selectedAnnotation.id),
        content: (
          <TooltipContainer>
            <Button
              type="ghost"
              icon="DocumentPlus"
              onClick={() => {
                onAddContainerReferences([
                  {
                    type: ContainerReferenceType.FILE,
                    id: resourceId,
                    page: 1,
                  },
                ]);
              }}
            >
              Add file to view
            </Button>
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      },
    ];
  }, [
    annotations,
    selectedAnnotation,
    onAddContainerReferences,
    containerReferences,
  ]);
};

export default useIndustryCanvasFileLinkTooltips;
