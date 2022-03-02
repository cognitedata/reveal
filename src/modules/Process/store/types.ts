import {
  AnnotationJob,
  VisionAPIType,
  DetectionModelParams,
} from 'src/api/vision/detectionModels/types';
import { GenericTabularState } from 'src/store/genericTabularDataSlice';

export type JobState = AnnotationJob & {
  fileIds: number[];
  completedFileIds?: number[];
  failedFileIds?: number[];
  failedFiles?: { fileId: number; error: string }[];
};
export type ProcessState = GenericTabularState & {
  fileIds: number[];
  showFileUploadModal: boolean;
  files: {
    byId: Record<number, { jobIds: number[] }>;
    allIds: number[];
  };
  uploadedFileIds: number[];
  jobs: {
    byId: Record<number, JobState>;
    allIds: number[];
  };
  error?: string;
  selectedDetectionModels: Array<VisionAPIType>;
  availableDetectionModels: {
    modelName: string;
    type: VisionAPIType;
    settings: DetectionModelParams;
    unsavedSettings: DetectionModelParams;
  }[];
  showExploreModal: boolean;
  showSummaryModal: boolean;
};
