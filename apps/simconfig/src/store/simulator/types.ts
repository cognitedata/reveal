import { RequestStatus } from 'store/types';

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export type Simulator = {
  dataSetName: string;
  dataSetWriteProtected: boolean;
  simulator: SimulatorBackend;
  name: string;
  heartbeat: number;
  dataSet: number;
  connectorVersion: string;
};
export interface SimulatorState {
  requestStatus: RequestStatus;
  initialized: boolean;
  simulators: Simulator[];
}
