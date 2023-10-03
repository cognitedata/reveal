import type { StoreState } from '../types';

export const selectCapabilities = (state: StoreState) => state.capabilities;

const isFeatureEnabled = (state: StoreState, featureName: string) => {
  const {
    capabilities: { capabilities },
  } = state;
  return (
    capabilities
      ?.find((feature) => feature.name === featureName)
      ?.capabilities?.every((capability) => capability.enabled) ?? false
  );
};

export const selectIsDeleteEnabled = (state: StoreState) =>
  isFeatureEnabled(state, 'Delete');

export const selectIsLabelsEnabled = (state: StoreState) =>
  isFeatureEnabled(state, 'Labels');
