import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { AzureConfig } from 'tenants/types';

export const useIdToken = (useIdToken: boolean) => {
  const { data: azureConfig } =
    useTenantConfigByKey<AzureConfig>('azureConfig');

  return useIdToken && azureConfig && azureConfig.enabled;
};
