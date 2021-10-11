import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { MapConfig } from 'tenants/types';

export const useMapConfig = () => {
  return useTenantConfigByKey<MapConfig>('map');
};
