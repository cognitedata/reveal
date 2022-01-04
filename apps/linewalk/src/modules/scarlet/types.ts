import { FileInfo } from '@cognite/sdk';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';

export enum DataSetId {
  P66_EquipmentScans = 2527096956319199,
  PCMS = 5719472077867126,
  P66_ScarletScannerResults = 6047348858495410,
}

export enum DocumentType {
  U1 = 'U1',
}

export type ScarletDocument = FileInfo & {
  downloadUrl?: string;
  pdf?: PDFDocumentProxy;
};

export type APIResponse<T> = {
  loading: boolean;
  error?: any;
  data?: T;
};
