import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { Modules } from 'modules/sidebar/types';
import { WellConfig } from 'tenants/types';

export const useWellConfig = () => {
  return useTenantConfigByKey<WellConfig>(Modules.WELLS);
};
