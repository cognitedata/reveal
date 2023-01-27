import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import { TooltipContainer } from '@data-exploration-components/containers/Files/Canvas/TooltipContainer';
import {
  getExtendedAnnotationLabel,
  getResourceIdFromExtendedAnnotation,
  isAssetAnnotation,
} from '@data-exploration-components/containers/Files/FilePreview/FilePreviewUFV/migration/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import styled from 'styled-components';

import React, { useMemo } from 'react';

const AssetLabel = styled.div`
  padding: 8px;
  margin-right: 4px;
`;

const useCanvasAssetTooltips = (
  selectedAnnotation: ExtendedAnnotation | undefined
) => {
  return useMemo(() => {
    if (selectedAnnotation === undefined) {
      return [];
    }

    if (isAssetAnnotation(selectedAnnotation) === false) {
      return [];
    }

    return [
      {
        targetId: String(selectedAnnotation?.id),
        content: (
          <TooltipContainer>
            <AssetLabel>
              {getExtendedAnnotationLabel(selectedAnnotation) ?? 'N/A'}
            </AssetLabel>
            <Button
              type="ghost"
              icon="ExternalLink"
              href={createLink(
                `/explore/search/asset/${getResourceIdFromExtendedAnnotation(
                  selectedAnnotation
                )}`
              )}
              target={'_blank'}
            />
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_LEFT,
        shouldPositionStrictly: true,
      },
    ];
  }, [selectedAnnotation]);
};

export default useCanvasAssetTooltips;
