import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import {
  ExtendedAnnotation,
  getSearchParams,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from './migration';

const useFileLinkTooltips = (
  isEnabled: boolean,
  fileId: number,
  annotations: ExtendedAnnotation[],
  selectedAnnotations: ExtendedAnnotation[]
) => {
  const { t } = useTranslation();
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

    if (
      getResourceIdFromExtendedAnnotation(selectedAnnotation) ===
      getFileIdFromExtendedAnnotation(selectedAnnotation)
    ) {
      const initializeWithContainerReferences = btoa(
        JSON.stringify([
          {
            type: 'file',
            resourceId: fileId,
          },
        ])
      );

      return [
        {
          targetId: String(selectedAnnotation.id),
          content: (
            <TooltipContainer>
              <Tooltip
                content={t(
                  'OPEN_IN_INDUSTRIAL_CANVAS',
                  'Open in Industrial Canvas'
                )}
              >
                <Link
                  to={createLink(`/industrial-canvas`, {
                    ...getSearchParams(window.location.search),
                    initializeWithContainerReferences,
                  })}
                  aria-label="Open in Industrial Canvas"
                >
                  <Button icon="Canvas" type="ghost">
                    {t(
                      'OPEN_IN_INDUSTRIAL_CANVAS',
                      'Open in Industrial Canvas'
                    )}
                  </Button>
                </Link>
              </Tooltip>
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

    const initializeWithContainerReferences = btoa(
      JSON.stringify([
        {
          type: 'file',
          resourceId: fileId,
        },
        {
          type: 'file',
          resourceId: resourceFileId,
        },
      ])
    );

    return [
      {
        targetId: String(selectedAnnotation.id),
        content: (
          <TooltipContainer>
            <Tooltip
              content={t(
                'OPEN_IN_INDUSTRIAL_CANVAS',
                'Open in Industrial Canvas'
              )}
            >
              <Link
                to={createLink(`/industrial-canvas`, {
                  ...getSearchParams(window.location.search),
                  initializeWithContainerReferences,
                })}
                aria-label="Open in Industrial Canvas"
              >
                <Button icon="Canvas" type="ghost">
                  {t('OPEN_IN_INDUSTRIAL_CANVAS', 'Open in Industrial Canvas')}
                </Button>
              </Link>
            </Tooltip>
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_CENTER,
      },
    ];
  }, [isEnabled, annotations.length, selectedAnnotations, fileId, t]);
};

export const TooltipContainer = styled.div`
  background: white;
  padding: 4px;
  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
  border-radius: 6px;
  margin-bottom: 6px;
  display: flex;
`;

export default useFileLinkTooltips;
