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
  statusTime?: number;
}

export interface AnnotationsBadgeProps {
  gdpr?: ModelStatusAndAnnotationCounts;
  tag?: ModelStatusAndAnnotationCounts;
  text?: ModelStatusAndAnnotationCounts;
  objects?: ModelStatusAndAnnotationCounts;
}
