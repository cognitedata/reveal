import { KeysOfSCC } from '../../../../../utils/capabilities';

/** Acl names that we care about for DQ purposes. */
export type AclName = KeysOfSCC | 'sessionsAcl';

/** Dictionary of user's combined capabilities and their available actions. */
export type CapabilityActions = Record<AclName, string[]>;

export type Capability = Record<AclName, CapabilityAcl> & {
  projectScope: ProjectScope;
};

export type CapabilityAcl = {
  actions: string[];
  scope: CapabilityScope;
};

/** CDF capability scopes relevant for DQ. */
export type CapabilityScope = {
  all?: {};
  datasetScope?: { ids: string[] };
  idscope?: { ids: string[] };
  idScope?: { ids: string[] };
  spaceIdScope?: { spaceIds: string[] };
};

/** Allows filtering out capabilities outside of given project scope. */
export type ProjectScope = { allProjects: {} } | { projects: string[] };

/** Allows filtering out capabilities outside of specified scope. */
export type RequiredScope = {
  dataSetIds?: string[];
  spaceIds?: string[];
  timeSeriesIds?: string[];
};
