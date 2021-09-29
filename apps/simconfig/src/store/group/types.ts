import {
  Acl,
  Group,
  SingleCogniteCapability as Capability,
} from '@cognite/sdk';
import { RequestStatus } from 'store/types';

export interface GroupState {
  requestStatus: RequestStatus;
  initialized: boolean;
  groups: (Omit<Group, 'deletedTime'> & { deletedTime?: number })[];
}

// Type wrangling helpers
type AllKeys<T> = T extends any ? keyof T : never;

type TrimRight<
  StringType,
  TrimStringType extends string
> = StringType extends `${infer R}${TrimStringType}` ? R : never;

type PickKey<
  CapabilityType,
  CapabilityKey extends AllKeys<Capability>,
  K extends keyof Acl<any, any>
> = CapabilityType extends { [K in CapabilityKey]?: any }
  ? CapabilityType[CapabilityKey][K]
  : never;

// Convert union of ACL capability types from Cognite SDK for simpler HOC
// implementation.
//
// SingleCogniteCapability =
//   { groupsAcl: AclGroups } |
//   { assetsAcl: AclAssets } |
//   ...
//
// is converted to:
//
// Capabilities = {
//   groups?: AclActionGroups[] | undefined;
//   assets?: AclActionAssets[] | undefined;
//   ...
// }
export type Capabilities = {
  [K in TrimRight<AllKeys<Capability>, 'Acl'>]?: PickKey<
    Capability,
    `${K}Acl`,
    'actions'
  >;
};
