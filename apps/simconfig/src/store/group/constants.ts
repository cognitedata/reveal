import { RequestStatus } from 'store/types';

import { GroupState } from './types';

export const initialState: GroupState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  groups: [],
};
