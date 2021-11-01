import { FileFilterProps } from '@cognite/cdf-sdk-singleton';

export type VisionFilterItemProps = {
  filter: VisionFileFilterProps;
  setFilter: (newFilter: VisionFileFilterProps) => void;
};

// ToDo: remove once fileFilterProps have been properly updated with directoryPrefix field
export type VisionFileFilterProps = FileFilterProps & {
  directoryPrefix?: string;
  annotation?: AnnotationFilterType;
};

export type AnnotationFilterType = {
  generatedBy?: string;
  annotationText?: string;
  annotationState?: string;
};
