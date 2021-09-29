import { RequestStatus } from 'store/types';

import { DatasetState } from './types';

export const initialState: DatasetState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  datasets: [],
};
