import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { CommonState } from './types';

// TODO: not in use, remove?
export const selectCDFState = (
  state: CommonState
): {
  mode: CDFStatusModes;
  time?: number | undefined;
} => {
  const cdfSaveStatus = state.saveState;
  return cdfSaveStatus;
};
