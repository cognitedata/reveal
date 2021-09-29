import { RequestStatus } from 'store/types';

import { SimulatorState } from './types';

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export const initialState: SimulatorState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  simulators: [],
};

export const HEARTBEAT_TIMEOUT_SECONDS = 30; // 30 seconds
export const HEARTBEAT_POLL_INTERVAL = 60; // 1 minute
