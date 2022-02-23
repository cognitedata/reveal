import type { DefinitionMap, Simulator } from '@cognite/simconfig-api-sdk/rtk';

export const isValidSimulator = (simulator?: string): simulator is Simulator =>
  simulator === 'PROSPER' ||
  simulator === 'UNKNOWN' ||
  simulator === 'ProcessSim';

export const excludeUnknownSimulator = (
  simulators?: DefinitionMap['type']['simulator']
) => {
  if (!simulators) {
    return {};
  }
  const { UNKNOWN: _, ...availableSimulators } = simulators;
  return availableSimulators;
};
