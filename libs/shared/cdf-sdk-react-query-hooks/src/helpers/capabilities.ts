import { Capability } from '../types/capabilities';

/**
 * Returns true if any of the provided ids exists in the list of required ids (overlap of arrays).
 * If no required ids are given, the condition passes automatically.
 */
const hasRequiredIds = (
  requiredIds: string[] = [],
  providedIds: string[] = []
) =>
  requiredIds.length === 0 ||
  requiredIds.some((requiredId) => providedIds.includes(requiredId));

/** Checks if a given capability matches required project scope. */
export const isInProjectScope = (
  capability: Capability,
  requiredProjects?: string[]
) => {
  return capability.projectScope
    ? 'allProjects' in capability.projectScope ||
        hasRequiredIds(requiredProjects, capability.projectScope.projects)
    : true;
};
