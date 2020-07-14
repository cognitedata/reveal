export interface Document {
  id: number;
  fileName: string;
  metadata?: Metadata;
  directory?: string;
  source?: string;
  fileType?: string;
  assetIds?: number[];
  uploaded?: boolean;
  uploadedAt?: number;
}

export interface Metadata {
  [s: string]: string;
}

export interface DocumentType {
  key: string;
  description: string;
}

export interface JsonDocTypes {
  [s: string]: string;
}

export interface DocumentsByCategory {
  [s: string]: {
    description: string;
    documents: Document[];
  };
}

export interface CategoryByDocumentId {
  [s: number]: {
    category: string;
    description: string;
    document: Document;
  };
}

export interface Priority {
  [s: string]: number;
}

export interface TextContainerProps {
  scrollX?: boolean;
}
