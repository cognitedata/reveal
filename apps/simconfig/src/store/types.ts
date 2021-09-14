import { DeepPartial, Store } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'store/reducer';
import { AuthContext } from '@cognite/react-container';

import { SimulatorRootAction, SimulatorState } from './simulator/types';

export enum RequestStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export type PartialRootState = DeepPartial<RootState>;

export type StoreAction = SimulatorRootAction;

export type StoreState = {
  simulator: SimulatorState;
  auth?: AuthContext;
};

export type AppStore = Store<StoreState, StoreAction>;

export type RootDispatcher = ThunkDispatch<StoreState, undefined, StoreAction>;
