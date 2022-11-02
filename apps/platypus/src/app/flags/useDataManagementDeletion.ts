import { useFlag } from '@cognite/react-feature-flags';

export const useDataManagementDeletionFeatureFlag = () => {
  return useFlag('DEVX_DATA_MANAGEMENT_DELETION', {
    fallback: false,
  });
};
