import { CDFResourceId, JobStatus } from 'src/api/types';

export type AutoMLModelType = 'classification' | 'objectdetection';

export interface AutoMLDownload {
  modelUrl: string;
}

export interface AutoMLMetrics {
  confidenceThreshold: number;
  precision: number;
  recall: number;
  f1score: number;
}
export interface AutoMLModelEvaluation {
  metrics: AutoMLMetrics[];
  meanAveragePrecision?: number;
  iouThreshold?: number;
}

export interface AutoMLModel {
  name: string;
  jobId: number;
  modelType: AutoMLModelType;
  status: JobStatus;
  modelEvaluation?: AutoMLModelEvaluation;
  modelUrl?: string;
}

export interface AutoMLTrainingJob extends AutoMLModel {
  createdTime: number;
  startTime: number;
  statusTime: number;
}

export interface AutoMLTrainingJobPostRequest extends AutoMLTrainingJob {
  items: CDFResourceId[];
}
