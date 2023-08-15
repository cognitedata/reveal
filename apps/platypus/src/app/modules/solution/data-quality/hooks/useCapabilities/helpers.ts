import { AclName, Capability, CapabilityActions, RequiredScope } from './types';

/** Extracts acl name from a valid capability object. */
export const getCapabilityAcl = (capability: Capability) => {
  return Object.keys(capability).find((key) => key.endsWith('Acl')) as
    | AclName
    | undefined;
};

/**
 * Creates a dictionary from capabilities like { aclName: actions[] }.
 * Combines multiple capabilities of the same kind into a single entry.
 */
export const groupCapabilities = (capabilities?: Capability[]) => {
  return capabilities?.reduce((group, capability) => {
    const acl = getCapabilityAcl(capability);

    if (acl) {
      const existingActions = group[acl] ?? [];
      group[acl] = [
        ...new Set(existingActions.concat(capability[acl].actions)),
      ];
    }

    return group;
  }, {} as CapabilityActions);
};

/**
 * Returns true if any of the provided ids exists in the list of required ids (overlap of arrays).
 * If no required ids are given, the condition passes automatically.
 */
export const hasRequiredIds = (
  requiredIds: string[] = [],
  providedIds: string[] = []
) =>
  requiredIds.length === 0 ||
  requiredIds.some((requiredId) => providedIds.includes(requiredId));

/**
 * Checks if given capability has a valid acl and matches required capability scope.
 * Required scope can combine multiple entities like dataSetIds, spaceIds, etc.
 * Certain scopes, like data sets, time series or extraction pipelines use idscope/idScope
 * and need to be checked against the acl to disambiguate the required scope.
 */
export const isInCapabilityScope = (
  capability: Capability,
  requiredScope: RequiredScope
) => {
  const { dataSetIds = [], spaceIds = [], timeSeriesIds = [] } = requiredScope;
  const acl = getCapabilityAcl(capability);

  if (!acl) return false;

  const { scope } = capability[acl];

  if ('all' in scope) return true;

  if ('datasetScope' in scope)
    return hasRequiredIds(dataSetIds, scope.datasetScope?.ids);

  if ('spaceIdScope' in scope)
    return hasRequiredIds(spaceIds, scope.spaceIdScope?.spaceIds);

  if (acl === 'datasetsAcl' && 'idScope' in scope)
    return hasRequiredIds(dataSetIds, scope.idScope?.ids);

  if (acl === 'timeSeriesAcl' && 'idscope' in scope)
    return hasRequiredIds(timeSeriesIds, scope.idscope?.ids);

  return false;
};

/** Checks if a given capability matches required project scope. */
export const isInProjectScope = (
  capability: Capability,
  requiredProjects?: string[]
) => {
  return (
    'allProjects' in capability.projectScope ||
    hasRequiredIds(requiredProjects, capability.projectScope.projects)
  );
};
