import type {
  SimconfigApiBaseStoreState,
  SimconfigApiPropertiesState,
} from '@cognite/simconfig-api-sdk/rtk';

import type { AppState } from './app/types';
import type { CapabilitiesState } from './capabilities/types';
import type { GroupState } from './group/types';

export enum RequestStatus {
  Idle,
  Loading,
  Success,
  Error,
}

export interface StoreState extends SimconfigApiBaseStoreState {
  app: AppState;
  group: GroupState;
  capabilities: CapabilitiesState;
  simconfigApiProperties: SimconfigApiPropertiesState;
}
