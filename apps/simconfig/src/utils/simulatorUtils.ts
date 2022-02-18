import type { Simulator } from '@cognite/simconfig-api-sdk/rtk';

export const isValidSimulator = (simulator?: string): simulator is Simulator =>
  simulator === 'PROSPER' ||
  simulator === 'UNKNOWN' ||
  simulator === 'ProcessSim';
