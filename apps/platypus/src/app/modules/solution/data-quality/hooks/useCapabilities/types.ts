import { UseQueryOptions } from '@tanstack/react-query';

import { acls } from './consts';

export type AclName = (typeof acls)[number];

/** Dictionary of user's combined capabilities and their available actions. */
export type CapabilityActions = Record<AclName, string[]>;

export type Capability = Record<AclName, CapabilityAcl> & {
  projectScope: ProjectScope;
};

export type CapabilityAcl = {
  actions: string[];
  scope: CapabilityScope;
};

/** Available scopes of CDF capabilities. */
export type CapabilityScope = {
  all?: {};
  assetRootIdScope?: { rootIds: string[] };
  currentuserscope?: {};
  datasetScope?: { ids: string[] };
  extractionPipelineScope?: { ids: string[] };
  idscope?: { ids: string[] };
  idScope?: { ids: string[] };
  spaceIdScope?: { spaceIds: string[] };
  tableScope?: { dbsToTables: TableScopeDbs };
};

/** Allows filtering out capabilities outside of given project scope. */
export type ProjectScope = { allProjects: {} } | { projects: string[] };

/** Allows filtering out capabilities outside of specified scope. */
export type RequiredScope = {
  assetRootIds?: string[];
  dataSetIds?: string[];
  dbsToTables?: TableScopeDbs;
  extractionPipelineIds?: string[];
  securityCategoryIds?: string[];
  spaceIds?: string[];
  timeSeriesIds?: string[];
};

export type TableScopeDbs = { [databaseName: string]: { tables?: string[] } };

export type UseCapabilitiesOptions = {
  options?: UseQueryOptions<Capability[]>;
  projectScope?: string | string[];
};
