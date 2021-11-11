import { AnnotationStatuses } from 'src/modules/Common/types';

export const showBadge = (
  count?: number,
  statuses?: AnnotationStatuses
): boolean => {
  return !!count || !!statuses?.status;
};

export const showGDPRBadge = (count?: number) => !!(count && count > 0);
