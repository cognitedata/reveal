import { FileInfo } from '@cognite/sdk';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';

export enum DocumentType {
  U1 = 'U1',
}

export type ScarletDocument = FileInfo & {
  downloadUrl?: string;
  pdf?: PDFDocumentProxy;
};
