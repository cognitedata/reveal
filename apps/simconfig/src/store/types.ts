import { AuthContext } from '@cognite/react-container';

import { DatasetState } from './dataset/types';
import { GroupState } from './group/types';
import { SimulatorState } from './simulator/types';
import { FileState } from './file/types';

export enum RequestStatus {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export type StoreState = {
  auth?: AuthContext;
  dataset: DatasetState;
  group: GroupState;
  simulator: SimulatorState;
  file: FileState;
};
