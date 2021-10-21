import { RequestStatus } from 'store/types';

export interface BoundaryConditionState {
  requestStatus: RequestStatus;
  initialized: boolean;
  boundaryConditions: BoundaryConditionValue[];
}

export interface BoundaryConditionValue {
  value: string | number;
  label: string;
  unit: string;
}
