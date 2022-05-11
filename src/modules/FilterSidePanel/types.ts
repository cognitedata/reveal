import { FileFilterProps, DateRange } from '@cognite/sdk';

export enum MediaTypeOption {
  image = 'Image',
  video = 'Video',
}

export enum DateActions {
  created = 'Created',
  uploaded = 'Uploaded',
  captured = 'Captured',
}
export enum DateOptions {
  before = 'Before',
  after = 'After',
  range = 'Range',
}

export type VisionFilterItemProps = {
  filter: VisionFileFilterProps;
  setFilter: (newFilter: VisionFileFilterProps) => void;
};

// ToDo: remove once fileFilterProps have been properly updated with directoryPrefix field
export type VisionFileFilterProps = FileFilterProps & {
  // directoryPrefix should added to FileFilterProps
  directoryPrefix?: string;
  annotation?: AnnotationFilterType;
  dateFilter?: DateFilterType;
  timeRange?: DateRange;
  mediaType?: MediaTypeOption;
};

export type AnnotationFilterType = {
  annotationLabelOrText?: string;
  annotationState?: string;
};

export type DateFilterType = {
  action?: DateActions;
  dateOption?: DateOptions;
};
