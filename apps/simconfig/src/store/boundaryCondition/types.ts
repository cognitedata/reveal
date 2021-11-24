import { RequestStatus } from 'store/types';

interface NumericValue {
  base?: number;
  exponent?: number;
}

export interface BoundaryConditionState {
  requestStatus: RequestStatus;
  initialized: boolean;
  boundaryConditions: BoundaryConditionValue[];
  chartsLink: string;
}

export interface BoundaryConditionValue {
  value?: NumericValue;
  rawValue?: number;
  label: string;
  unit?: string;
  displayUnit: string;
}
