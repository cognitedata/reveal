import { createReducer } from 'typesafe-actions';

import { RequestStatus } from '../types';

import {
  SimulatorActionTypes,
  SimulatorRootAction,
  SimulatorState,
} from './types';

export const initialState: SimulatorState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  simulators: [],
};

export const SimulatorReducer = createReducer(initialState)
  .handleAction(
    SimulatorActionTypes.READ_SIMULATORS,
    (state: SimulatorState) => ({
      ...state,
      requestStatus: RequestStatus.LOADING,
    })
  )
  .handleAction(
    SimulatorActionTypes.READ_SIMULATORS_SUCCESS,
    (_: SimulatorState, action: SimulatorRootAction) => ({
      requestStatus: RequestStatus.SUCCESS,
      initialized: true,
      simulators: action.payload,
    })
  )
  .handleAction(
    SimulatorActionTypes.READ_SIMULATORS_ERROR,
    (state: SimulatorState) => ({
      ...state,
      requestStatus: RequestStatus.ERROR,
    })
  );
