import { JobStatus } from 'src/api/types';

export type DetectionModelStatusAndCount = {
  status: JobStatus;
  count?: number;
};

export type AnnotationStatusAndCount = {
  gdprDetctionStatus: DetectionModelStatusAndCount;
  tagDetctionStatus: DetectionModelStatusAndCount;
  genericDetctionStatus: DetectionModelStatusAndCount;
};
