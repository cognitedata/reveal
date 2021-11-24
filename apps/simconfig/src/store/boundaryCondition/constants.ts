import { RequestStatus } from 'store/types';

import { BoundaryConditionState } from './types';

export const initialState: BoundaryConditionState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  boundaryConditions: [],
  chartsLink: '',
};
