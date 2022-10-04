import {
  AclScopeAll,
  AclScopeAnalytics,
  AclScopeApiKeys,
  AclScopeAssets,
  AclScopeDatasets,
  AclScopeEvents,
  AclScopeFiles,
  AclScopeGroups,
  AclScopeProjects,
  AclScopeRaw,
  SingleCogniteCapability,
} from '@cognite/sdk';
import React from 'react';

// would be nice to get these from the sdk
// keyof SingleCogniteCapability?
export type AclName =
  | 'analyticsAcl'
  | 'apikeysAcl'
  | 'assetsAcl'
  | 'datasetsAcl'
  | 'eventsAcl'
  | 'filesAcl'
  | 'geospatialAcl'
  | 'labelsAcl'
  | 'projectsAcl'
  | 'rawAcl'
  | 'relationshipsAcl'
  | 'securityCategoriesAcl'
  | 'seismicAcl'
  | 'sequencesAcl'
  | 'threedAcl'
  | 'timeSeriesAcl'
  | 'usersAcl'
  | 'wellsAcl';

type Capability = SingleCogniteCapability & {
  scope?: AclScopeAll;
  projectScope?: { projects: string[] };
};
export type InspectResult = {
  capabilities: Capability[];
};
export type AccessRequirement = {
  context: string;
  aclName: AclName;
  acl: string[];
};
export type AccessRequirements = AccessRequirement[];

export type ProcessedAcls = Partial<
  Record<AclName, Capability & { actions: string[] }>
>;
export type AccessCheckResultItem = {
  error?: string; // any extra error info we have found, eg: missing dataset
  missing: string[];
  name: string;
  scope?:
    | AclScopeAnalytics
    | AclScopeApiKeys
    | AclScopeAssets
    | AclScopeDatasets
    | AclScopeEvents
    | AclScopeFiles
    | AclScopeGroups
    | AclScopeProjects
    | AclScopeRaw;
};

export type AccessCheckResult = AccessCheckResultItem[];

export type FCWithChildren<T> = React.FC<React.PropsWithChildren<T>>;
