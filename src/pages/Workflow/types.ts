import { JobStatus } from 'src/api/types';

export type AnnotationCounts = {
  modelGenerated?: number;
  manuallyGenerated?: number;
  verified?: number;
  rejected?: number;
  unhandled?: number;
};

export interface ModelStatusAndAnnotationCounts extends AnnotationCounts {
  status?: JobStatus;
}

export interface AnnotationsBadgeProps {
  gdpr?: ModelStatusAndAnnotationCounts;
  tag?: ModelStatusAndAnnotationCounts;
  textAndObjects?: ModelStatusAndAnnotationCounts;
}
