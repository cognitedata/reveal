import { APIState, DocumentsData, PCMSData, ScannerData } from '../../types';

export type StorageState = {
  pcms: APIState<PCMSData>;
  documents: APIState<DocumentsData>;
  scanner: APIState<ScannerData>;
};

export type StorageAction =
  | {
      type: StorageActionType.SET_PCMS;
      pcms: APIState<PCMSData>;
    }
  | {
      type: StorageActionType.SET_DOCUMENTS;
      documents: APIState<DocumentsData>;
    }
  | {
      type: StorageActionType.SET_SCANNER;
      scanner: APIState<ScannerData>;
    };

export enum StorageActionType {
  SET_PCMS = 'set-pcms',
  SET_DOCUMENTS = 'set-documents',
  SET_SCANNER = 'set-scanner',
}
