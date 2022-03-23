import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Annotation = {
  id: string;
  type: string;
  boundingBox: BoundingBox;
  svgPaths: { svgCommands: string }[];
  nearestAssetExternalIds: [];
  lineNumbers: string[];
  labelIds?: string[];
  text?: string;
};

export type LineReviewAnnotationStatus = 'UNCHECKED' | 'CHECKED';
export type DateTime = number;
export type Assignee = {
  name: string;
};
export type Comment = {
  text: string;
  user: {
    name: string;
  };
};

export type DocumentConnection = [string, string]; // List of annotation ids to connect

export enum DocumentType {
  PID = 'p&id',
  ISO = 'iso',
}

export type Link = {
  from: {
    documentId: string;
    annotationId: string;
  };
  to: {
    documentId: string;
    annotationId: string;
  };
};

export type ParsedDocument = {
  externalId: string;
  pdfExternalId: string;
  type: 'p&id' | 'iso';
  linking: Link[];
  viewBox: BoundingBox;
  annotations: Annotation[];
};

enum DiscrepancyStatus {
  OPEN = 'OPEN',
  REVIEW = 'REVIEW',
  IGNORED = 'IGNORED',
  RESOLVED = 'RESOLVED',
}

export enum LineReviewStatus {
  OPEN = 'OPEN',
  REVIEWED = 'REVIEWED',
  COMPLETED = 'COMPLETED',
}

type LineReviewDiscrepancy = {
  // 1. Is the annotation id unique? If not, we need the documentId as well (~~ different structure)
  // 2. Should annotationId be an array? i.e. that a discrepancy can link to multiple annotations
  // in different documents (i.e. both a P/ID and Isometric).
  annotationId: string[];
  status: DiscrepancyStatus;
  comments: Comment[];
  description: string;
  updatedAt?: Date;
  createdAt: Date;
};

export type LineReview = {
  id: string;
  name: string;
  system: string;
  discrepancies: LineReviewDiscrepancy[];
  assignees: Assignee[];
  entryFileExternalId: string;
  // All lines need to be manually reviewed at this stage, so a lack of discrepancies does not
  // mean that the review is complete.
  status: LineReviewStatus;
  comment?: string;
  parsedDocumentsExternalIds: string[];
};

export type DocumentsForLine = {
  externalId: string;
  line: string;
  parsedDocuments: string[];
};

export type LineReviewState = {
  discrepancies: Discrepancy[];
};

export enum AnnotationType {
  FILE_CONNECTION = 'fileConnection',
}
