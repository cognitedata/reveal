import {
  AGGREGATE_TYPE,
  BHP_ESTIMATION_METHOD,
  CHECK_TYPE,
  ROOT_FINDING_METHOD,
  GAUGE_DEPTH_UNIT,
  UNIT_TYPE,
} from './constants';

export interface CalculationConfig {
  simulator: string;
  unitSystem: string;
  modelName: string;
  calculationType: string;
  calculationName: string;
  connector: string;
  schedule: ConfigSchedule;
  dataSampling: ConfigDataSampling;
  logicalCheck: ConfigLogicalCheck;
  steadyStateDetection: ConfigSteadyStateDetection;
  inputTimeSeries: ConfigInputTimeSeries[];
  manualInputs: ConfigManualInput[];
  outputTimeSeries: ConfigOutputTimeSeries[];
  outputSequences: ConfigOutputSequence[];
  estimateBHP?: ConfigEstimateBHP;
  rootFindingSettings?: ConfigRootFindingSettings;
}
export interface ConfigSchedule {
  enabled: boolean;
  start: number;
  repeat: string;
}
export interface ConfigDataSampling {
  validationWindow: number;
  samplingWindow: number;
  granularity: number;
}
export interface ConfigLogicalCheck {
  enabled: boolean;
  externalId: string;
  aggregateType: keyof typeof AGGREGATE_TYPE;
  check: keyof typeof CHECK_TYPE;
  value: number;
}
export interface ConfigSteadyStateDetection {
  enabled: boolean;
  externalId: string;
  aggregateType: keyof typeof AGGREGATE_TYPE;
  minSectionSize: number;
  varThreshold: number;
  slopeThreshold: number;
}
export interface ConfigInputTimeSeries {
  name: string;
  type: string;
  sensorExternalId: string;
  unit: string;
  unitType: keyof typeof UNIT_TYPE;
  aggregateType: keyof typeof AGGREGATE_TYPE;
}
export interface ConfigManualInput {
  type: string;
  value: number;
  unit: string;
  unitType: string;
}
export interface ConfigOutputTimeSeries {
  name: string;
  type: string;
  unit: string;
  unitType: keyof typeof UNIT_TYPE;
  externalId?: string;
}
export interface ConfigOutputSequence {
  name: string;
  type: string;
}
export interface ConfigRootFindingSettings {
  rootTolerance: number;
  mainSolution: keyof typeof ROOT_FINDING_METHOD;
  bracket: Bracket;
}
interface Bracket {
  lowerBound: number;
  upperBound: number;
}
export interface ConfigEstimateBHP {
  enabled: boolean;
  method: keyof typeof BHP_ESTIMATION_METHOD;
  gaugeDepth?: GaugeDepth;
}

interface GaugeDepth {
  value: number;
  unit: keyof typeof GAUGE_DEPTH_UNIT;
}
