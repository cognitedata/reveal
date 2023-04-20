import { createLink } from '@cognite/cdf-utilities';
import { Link } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import { useCanvasFilesFromUrl } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@data-exploration-components/containers/Files/FilePreview/migration/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import React, { useMemo } from 'react';
import { TooltipContainer } from '../Canvas/TooltipContainer';

const useFileLinkTooltips = (
  isEnabled: boolean,
  fileId: number,
  annotations: ExtendedAnnotation[],
  selectedAnnotations: ExtendedAnnotation[]
) => {
  const { serialize } = useCanvasFilesFromUrl();
  return useMemo(() => {
    if (!isEnabled) {
      return [];
    }

    if (annotations.length === 0) {
      return [];
    }

    if (selectedAnnotations.length !== 1) {
      return [];
    }

    const selectedAnnotation = selectedAnnotations[0];

    if (getResourceTypeFromExtendedAnnotation(selectedAnnotation) !== 'file') {
      return [];
    }

    // Filter out self-referential file links, that's not a case for the multi-file viewer
    if (
      getResourceIdFromExtendedAnnotation(selectedAnnotation) ===
      getFileIdFromExtendedAnnotation(selectedAnnotation)
    ) {
      // TODO: How should we differentiate for the user that it's a self-referential link?
      // Right now we are just not displaying the tooltip, but there's no way for the user to know
      // that this is the case.
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

    const resourceFileId =
      getResourceIdFromExtendedAnnotation(selectedAnnotation);
    if (resourceFileId === undefined) {
      return [];
    }

    // Fix: Get target file annotation page number! This is currently unsupported by Annotations API.
    const shamefulPageNumber = 1;

    return [
      {
        targetId: String(selectedAnnotation.id),
        content: (
          <TooltipContainer>
            <Link
              href={createLink(`/explore/canvas`, {
                files: serialize([
                  { id: fileId, page: shamefulPageNumber },
                  { id: resourceFileId, page: shamefulPageNumber },
                ]),
              })}
              target="_blank"
            >
              Open side-by-side
            </Link>
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
      },
    ];
  }, [isEnabled, annotations, selectedAnnotations, fileId, serialize]);
};

export default useFileLinkTooltips;
