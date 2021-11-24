import { LabelVariants } from '@cognite/cogs.js';

export const STATUS_TYPE: { [x: string]: LabelVariants } = {
  none: 'unknown',
  ready: 'default',
  running: 'warning',
  success: 'success',
  failure: 'danger',
};

export enum POLLING_TIME {
  LONG = 15 * 1000,
  SHORT = 1000,
}
export enum EVENT_CONSTANTS {
  SIM_CALC = 'Simulation Calculation',
  PROSPER_SIM_EVENT = 'simulation event',
  MANUAL = 'manual',
  READY_STATUS_MESSAGE = 'Calculation ready to run',
}
