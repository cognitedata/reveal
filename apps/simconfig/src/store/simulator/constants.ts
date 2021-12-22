import { RequestStatus } from 'store/constants';

import type { SimulatorState } from './types';

export const initialState: SimulatorState = {
  requestStatus: RequestStatus.Idle,
  initialized: false,
  simulators: [],
};

export const HEARTBEAT_TIMEOUT_SECONDS = 60; // 60 seconds
export const HEARTBEAT_POLL_INTERVAL = 30; // 30 seconds
