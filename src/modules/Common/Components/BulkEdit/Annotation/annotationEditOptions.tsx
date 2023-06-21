import { Status } from 'src/api/annotation/types';

export type AnnotationEditOptionType = {
  value: string;
  label: string;
  annotationState?: Status;
};

export const annotationEditOptions: AnnotationEditOptionType[] = [
  {
    label: 'All annotations',
    value: 'allAnnotations',
  },
  {
    label: 'All rejected',
    value: 'allRejected',
    annotationState: Status.Rejected,
  },
  {
    label: 'All unhandled',
    value: 'allUnhandled',
    annotationState: Status.Suggested,
  },
  {
    label: 'All verified',
    value: 'allVerified',
    annotationState: Status.Approved,
  },
];
