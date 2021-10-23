import { StoreState } from 'store/types';

export const selectBoundaryConditions = (state: StoreState) =>
  state.boundaryCondition.boundaryConditions;

export const selectBoundaryConditionsStatus = (state: StoreState) =>
  state.boundaryCondition.requestStatus;
