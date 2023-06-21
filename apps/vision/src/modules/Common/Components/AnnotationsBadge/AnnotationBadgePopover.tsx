import React from 'react';

import { AnnotationsBadge } from '@vision/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '@vision/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import { Popover } from '@vision/modules/Common/Components/Popover';
import {
  AnnotationsBadgeCounts,
  AnnotationsBadgeStatuses,
} from '@vision/modules/Common/types';
import {
  hasJobsFailedForFile,
  isProcessingFile,
} from '@vision/modules/Process/store/utils';

export const AnnotationsBadgePopover = (
  annotationCounts: AnnotationsBadgeCounts,
  annotationStatuses: AnnotationsBadgeStatuses
) => {
  const showPopover =
    !isProcessingFile(annotationStatuses) &&
    !hasJobsFailedForFile(annotationStatuses);
  if (showPopover)
    return (
      <Popover
        placement="bottom"
        content={AnnotationsBadgePopoverContent(
          annotationCounts,
          annotationStatuses
        )}
      >
        <>{AnnotationsBadge(annotationCounts, annotationStatuses)}</>
      </Popover>
    );
  return <>{AnnotationsBadge(annotationCounts, annotationStatuses)}</>;
};
