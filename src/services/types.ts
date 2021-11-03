import { Label } from '@cognite/sdk';
import { DOCUMENTS_AGGREGATES } from './constants';

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
  source?: string;
  fileType?: string;
  documentType?: string;
}

export type Aggregates = {
  [aggregate in keyof typeof DOCUMENTS_AGGREGATES]: {
    name: string;
    value: number;
  }[];
};

export type LabelFileUpdate = {
  label: Label;
  documentIds: number[];
};
export type FilesAPIError = {
  errors: { status: number; message: string }[];
};
