import { ActionType } from 'typesafe-actions';
import { Moment } from 'moment';

import { RequestStatus } from '../types';

import * as actions from './actions';

export enum SimulatorActionTypes {
  READ_SIMULATORS = 'simulator/READ_SIMULATORS',
  READ_SIMULATORS_SUCCESS = 'simulator/READ_SIMULATORS_SUCCESS',
  READ_SIMULATORS_ERROR = 'simulator/READ_SIMULATORS_ERROR',
}

export enum SimulatorBackend {
  UNKNOWN = 'Unknown',
  PROSPER = 'PROSPER',
}

export type SimulatorRootAction = ActionType<typeof actions>;

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
