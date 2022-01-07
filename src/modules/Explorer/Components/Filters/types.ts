import { FileFilterProps, DateRange } from '@cognite/sdk';
import { DateActions, DateOptions } from './DateFilter';

export enum MediaTypeOption {
  image = 'Image',
  video = 'Video',
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
  annotationText?: string;
  annotationState?: string;
};

export type DateFilterType = {
  action?: DateActions;
  dateOption?: DateOptions;
};
