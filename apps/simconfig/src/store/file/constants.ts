import { RequestStatus } from 'store/types';

import { FileState } from './types';

export const initialState: FileState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  files: [],
  fileForDownload: undefined,
  processingDownload: false,
  selectedFile: undefined,
  currentCalculation: undefined,
  currentCalculationConfig: undefined,
  downloadLinks: [],
};
