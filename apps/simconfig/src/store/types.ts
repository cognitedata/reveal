import { AuthContext } from '@cognite/react-container';

import { DatasetState } from './dataset/types';
import { GroupState } from './group/types';
import { SimulatorState } from './simulator/types';
import { FileState } from './file/types';
import { BoundaryConditionState } from './boundaryCondition/types';
import { EventState } from './event/types';
import { NotificationState } from './notification/types';

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
  boundaryCondition: BoundaryConditionState;
  event: EventState;
  notification: NotificationState;
};
