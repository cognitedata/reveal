import type { AuthContext } from '@cognite/react-container';
import type {
  SimconfigApiBaseStoreState,
  SimconfigApiPropertiesState,
} from '@cognite/simconfig-api-sdk/rtk';

import type { GroupState } from './group/types';

export enum RequestStatus {
  Idle,
  Loading,
  Success,
  Error,
}

export type StoreState = SimconfigApiBaseStoreState & {
  auth?: AuthContext;
  group: GroupState;
  simconfigApiProperties: SimconfigApiPropertiesState;
};
