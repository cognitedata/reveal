import { RequestStatus } from 'store/types';

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export type Simulator = {
  simulator: SimulatorBackend;
  name: string;
  heartbeat: number;
};

export interface SimulatorState {
  requestStatus: RequestStatus;
  initialized: boolean;
  simulators: Simulator[];
}
