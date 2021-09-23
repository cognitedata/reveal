import { AuthContext } from '@cognite/react-container';

import { SimulatorState } from './simulator/types';

export enum RequestStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export type StoreState = {
  simulator: SimulatorState;
  auth?: AuthContext;
};
