import { RequestStatus } from 'store/types';

import { FileState } from './types';

export const initialState: FileState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  files: [],
  selectedFile: undefined,
  downloadLinks: [],
};
