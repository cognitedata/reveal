import { RequestStatus } from 'store/types';

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export type Simulator = {
  simulator: SimulatorBackend;
  name: string;
  heartbeat: number;
  modelLibraryDataSet: number;
  configurationLibraryDataSet: number;
  connectorVersion: string;
};

export interface SimulatorState {
  requestStatus: RequestStatus;
  initialized: boolean;
  simulators: Simulator[];
}
