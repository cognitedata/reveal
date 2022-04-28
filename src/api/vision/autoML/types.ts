import { FileIdEither, JobStatus } from 'src/api/vision/detectionModels/types';

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

export interface AutoMLModelCore {
  name: string;
  jobId: number;
  modelType: AutoMLModelType;
}
export interface AutoMLModel extends AutoMLModelCore {
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
  items: FileIdEither[];
}
