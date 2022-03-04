import { Label } from '@cognite/sdk';
import { DOCUMENTS_AGGREGATES } from './constants';

export type { DocumentsSearchRequest } from '@cognite/sdk-playground';

export interface ClassifierTrainingSet {
  id: string;
  label: string;
  count?: number;
  description?: string;
}

export interface LabelCount {
  [label: string]: number;
}

export interface LabelDescription {
  [label: string]: string | undefined;
}

export interface DocumentSearchQuery {
  searchQuery?: string;
  sources?: string[];
  fileTypes?: string[];
  labels?: string[];
}

export type Aggregates = {
  [aggregate in keyof typeof DOCUMENTS_AGGREGATES]: {
    name: string;
    value: number;
  }[];
};

export type LabelFileUpdate = {
  label: Label;
  fileIds: number[];
};
export type FilesApiError = {
  errors: { status: number; message: string }[];
};

export interface ApiError {
  message?: string;
  status?: number;
}

export type ClassifierStatus = 'queuing' | 'training' | 'finished' | 'failed';
