import type { DefinitionMap } from '@cognite/simconfig-api-sdk/rtk';

export const excludeUnknownSimulator = (
  simulators?: DefinitionMap['type']['simulator']
) => {
  if (!simulators) {
    return {};
  }
  const { UNKNOWN: _, ...availableSimulators } = simulators;
  return availableSimulators;
};
