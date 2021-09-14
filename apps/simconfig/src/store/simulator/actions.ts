import { createAction } from 'typesafe-actions';

import { SimulatorActionTypes, Simulator } from './types';

export const readSimulators = createAction(
  SimulatorActionTypes.READ_SIMULATORS
)<void>();
export const readSimulatorsSuccess = createAction(
  SimulatorActionTypes.READ_SIMULATORS_SUCCESS
)<Simulator[]>();
export const readSimulatorsError = createAction(
  SimulatorActionTypes.READ_SIMULATORS_ERROR
)<void>();
