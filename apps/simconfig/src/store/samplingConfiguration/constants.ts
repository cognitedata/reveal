import { RequestStatus } from 'store/types';

import { SamplingConfigurationState } from './types';

export const initialState: SamplingConfigurationState = {
  requestStatus: RequestStatus.IDLE,
  samplingConfiguration: undefined,
  chartsInputLink: undefined,
  chartsOutputLink: undefined,
};
