import { createLink } from '@cognite/cdf-utilities';
import {
  getFileIdFromExtendedAnnotation,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@cognite/data-exploration';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import FileTooltip from '../components/ContextualTooltips/FileTooltip/FileTooltip';
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
        (containerReference) =>
          containerReference.type === ContainerReferenceType.FILE &&
          containerReference.resourceId === additionalFileId
      )
    ) {
      return [];
    }

    const onAddFileClick = () => {
      onAddContainerReferences([
        {
          type: ContainerReferenceType.FILE,
          resourceId: resourceId,
          id: resourceId.toString(),
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
