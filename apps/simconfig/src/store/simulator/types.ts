import type { Simulator as SimulatorBackend } from '@cognite/simconfig-api-sdk/rtk';

import type { RequestStatus } from 'store/types';

export interface Simulator {
  dataSetName: string;
  dataSetWriteProtected: boolean;
  simulator: SimulatorBackend;
  name: string;
  heartbeat: number;
  dataSet: number;
  connectorVersion: string;
}

export interface SimulatorState {
  requestStatus: RequestStatus;
  initialized: boolean;
  simulators: Simulator[];
}
