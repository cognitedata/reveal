import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { Modules } from 'modules/sidebar/types';
import { SeismicConfig } from 'tenants/types';

export const useSeismicConfig = () => {
  return useTenantConfigByKey<SeismicConfig>(Modules.SEISMIC);
};
