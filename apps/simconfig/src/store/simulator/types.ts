import { Moment } from 'moment';

import { RequestStatus } from '../types';

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export type Simulator = {
  simulator: SimulatorBackend;
  name: string;
  heartbeat: Moment;
};

export interface SimulatorState {
  requestStatus: RequestStatus;
  initialized: boolean;
  simulators: Simulator[];
}
