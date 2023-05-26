import React, { useMemo } from 'react';

import { TooltipContainer } from '@data-exploration-components/containers/Files/Canvas/TooltipContainer';
import {
  PagedFileReference,
  useCanvasFilesFromUrl,
} from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import {
  getFileIdFromExtendedAnnotation,
  getResourceExternalIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@data-exploration-components/containers/Files/FilePreview/migration/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { Button } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

type UseFileLinkTooltipsParams = {
  annotations: ExtendedAnnotation[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  onAddFile: (file: PagedFileReference) => void;
};

const useCanvasFileLinkTooltips = ({
  annotations,
  selectedAnnotation,
  onAddFile,
}: UseFileLinkTooltipsParams) => {
  const { files } = useCanvasFilesFromUrl();

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

    if (files.some((file) => file.id === additionalFileId)) {
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
              onClick={() =>
                onAddFile({
                  id: resourceId,
                  page: 1,
                })
              }
            >
              Add file to view
            </Button>
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      },
    ];
  }, [annotations, selectedAnnotation, onAddFile, files]);
};

export default useCanvasFileLinkTooltips;
