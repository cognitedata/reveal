export type AnnotationEditOptionType = {
  value: string;
  label: string;
  annotationState?: string;
};

export const annotationEditOptions: AnnotationEditOptionType[] = [
  {
    label: 'All annotations',
    value: 'allAnnotations',
  },
  {
    label: 'All rejected',
    value: 'allRejected',
    annotationState: 'rejected',
  },
  {
    label: 'All unhandled',
    value: 'allUnhandled',
    annotationState: 'unhandled',
  },
  {
    label: 'All verified',
    value: 'allVerified',
    annotationState: 'verified',
  },
];
