import { RequestStatus } from 'store/types';

export interface SamplingConfiguration {
  samplingStart?: number;
  samplingEnd?: number;
  ssdExternalId?: string;
  logicalCheckExternalId?: string;
  validationStart?: number;
  validationEnd?: number;
}

export interface SamplingConfigurationState {
  requestStatus: RequestStatus;
  samplingConfiguration: SamplingConfiguration | undefined;
  chartsInputLink: string | undefined;
  chartsOutputLink: string | undefined;
}
