import React from 'react';
import { AnnotationsBadge } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadge';
import {
  hasJobsFailedForFile,
  isProcessingFile,
} from 'src/modules/Process/store/utils';
import { Popover } from 'src/modules/Common/Components/Popover';
import { AnnotationsBadgePopoverContent } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationsBadgePopoverContent';
import {
  AnnotationsBadgeCounts,
  AnnotationsBadgeStatuses,
} from 'src/modules/Common/types';

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
