import { useFlag } from '@cognite/react-feature-flags';

export const useDataManagementDeletionFeatureFlag = () => {
  return useFlag('DATA_EXPLORATION_DEVX_DATA_MANAGEMENT_DELETION', {
    fallback: false,
  });
};
