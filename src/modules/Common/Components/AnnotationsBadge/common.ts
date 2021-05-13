import { AnnotationCounts, AnnotationStatuses } from '../../types';

export const showBadge = (
  counts?: AnnotationCounts,
  statuses?: AnnotationStatuses
) => counts?.manuallyGenerated || counts?.modelGenerated || statuses?.status;

export const showGDPRBadge = (badgeCounts?: AnnotationCounts) =>
  !!(badgeCounts?.modelGenerated && badgeCounts?.modelGenerated > 0);
