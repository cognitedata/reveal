import React from 'react';

import {
  hasJobsFailedForFile,
  isProcessingFile,
} from '../../../Process/store/utils';
import { AnnotationsBadgeCounts, AnnotationsBadgeStatuses } from '../../types';
import { Popover } from '../Popover';

import { AnnotationsBadge } from './AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from './AnnotationsBadgePopoverContent';

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
