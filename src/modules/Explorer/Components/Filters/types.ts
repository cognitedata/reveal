import { FileFilterProps, DateRange } from '@cognite/cdf-sdk-singleton';
import { DateActions, DateOptions } from './DateFilter';

export type VisionFilterItemProps = {
  filter: VisionFileFilterProps;
  setFilter: (newFilter: VisionFileFilterProps) => void;
};

// ToDo: remove once fileFilterProps have been properly updated with directoryPrefix field
export type VisionFileFilterProps = FileFilterProps & {
  directoryPrefix?: string;
  annotation?: AnnotationFilterType;
  dateFilter?: DateFilterType;
  timeRange?: DateRange;
};

export type AnnotationFilterType = {
  generatedBy?: string;
  annotationText?: string;
  annotationState?: string;
};

export type DateFilterType = {
  action?: DateActions;
  dateOption?: DateOptions;
};
