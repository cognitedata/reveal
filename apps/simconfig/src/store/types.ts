import type { AuthContext } from '@cognite/react-container';
import type {
  SimconfigApiBaseStoreState,
  SimconfigApiPropertiesState,
} from '@cognite/simconfig-api-sdk/rtk';

import type { GroupState } from './group/types';
import type { SimulatorState } from './simulator/types';

export enum RequestStatus {
  Idle,
  Loading,
  Success,
  Error,
}

export type StoreState = SimconfigApiBaseStoreState & {
  auth?: AuthContext;
  group: GroupState;
  simulator: SimulatorState;
  simconfigApiProperties: SimconfigApiPropertiesState;
};
