import { StoreState } from 'store/types';

export const selectBoundaryConditions = (state: StoreState) =>
  state.boundaryCondition.boundaryConditions;

export const selectIsBoundaryConditionsInitialized = (state: StoreState) =>
  state.boundaryCondition.initialized;
