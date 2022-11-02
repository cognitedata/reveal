import { useFlag } from '../../environments/useFlag';

export const useDataManagementDeletionFeatureFlag = () => {
  return useFlag('DEVX_DATA_MANAGEMENT_DELETION', {
    fallback: true,
  });
};
