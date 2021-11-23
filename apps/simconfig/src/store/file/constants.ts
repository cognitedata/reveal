import { RequestStatus } from 'store/types';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';

import { FileState } from './types';

export const initialConfigFile: CalculationConfig = {
  simulator: '',
  unitSystem: '',
  modelName: '',
  calculationType: '',
  calculationName: '',
  connector: '',
  schedule: {
    enabled: false,
    start: 0,
    repeat: '1d',
  },
  dataSampling: {
    validationWindow: 1440,
    samplingWindow: 60,
    granularity: 1,
  },
  logicalCheck: {
    enabled: false,
    externalId: '',
    aggregateType: 'min',
    check: 'eq',
    value: 0,
  },
  steadyStateDetection: {
    enabled: false,
    externalId: '',
    aggregateType: 'min',
    minSectionSize: 0,
    varThreshold: 0,
    slopeThreshold: 0,
  },
  inputTimeSeries: [],
  outputTimeSeries: [],
  outputSequences: [],
  manualInputs: [],
};
export const initialState: FileState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  files: [],
  fileForDownload: undefined,
  processingDownload: false,
  selectedFile: undefined,
  currentCalculation: undefined,
  currentCalculationConfig: undefined,
  currentCalculationConfigStatus: RequestStatus.IDLE,
  downloadLinks: [],
};
