import { useMemo } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@cognite/data-exploration';

import { ExtendedAnnotation, useMetrics } from '@data-exploration-lib/core';

import FileTooltip from '../components/ContextualTooltips/FileTooltip/FileTooltip';
import { ANNOTATION_TOOLTIP_POSITION, MetricEvent } from '../constants';
import { OnAddContainerReferences } from '../IndustryCanvasPage';
import { ContainerReferenceType } from '../types';

type UseFileLinkTooltipsParams = {
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  onAddContainerReferences: OnAddContainerReferences;
};

const useIndustryCanvasFileLinkTooltips = ({
  clickedContainerAnnotation: annotation,
  onAddContainerReferences,
}: UseFileLinkTooltipsParams) => {
  const trackUsage = useMetrics();

  return useMemo(() => {
    if (annotation === undefined) {
      return [];
    }

    if (getResourceTypeFromExtendedAnnotation(annotation) !== 'file') {
      return [];
    }

    const resourceId = getResourceIdFromExtendedAnnotation(annotation);

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
      trackUsage(MetricEvent.FILE_TOOLTIP_ADD_FILE);
    };

    const onViewClick = () => {
      window.open(createLink(`/explore/file/${resourceId}`), '_blank');
    };

    const isSelfReferential =
      getResourceIdFromExtendedAnnotation(annotation) ===
      getFileIdFromExtendedAnnotation(annotation);

    return [
      {
        targetId: String(annotation.id),
        content: (
          <FileTooltip
            id={resourceId}
            isCurrentFile={isSelfReferential}
            onAddFileClick={onAddFileClick}
            onViewClick={onViewClick}
          />
        ),
        anchorTo: ANNOTATION_TOOLTIP_POSITION,
        shouldPositionStrictly: true,
      },
    ];
  }, [annotation, onAddContainerReferences, trackUsage]);
};

export default useIndustryCanvasFileLinkTooltips;
