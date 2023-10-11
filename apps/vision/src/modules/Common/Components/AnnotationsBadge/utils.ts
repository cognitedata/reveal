import { AnnotationStatuses } from '../../types';

export const showBadge = (
  count?: number,
  statuses?: AnnotationStatuses
): boolean => {
  return !!count || !!statuses?.status;
};
