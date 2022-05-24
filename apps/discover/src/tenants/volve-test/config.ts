import { defaultWellsConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  // searchableLayerTitle: '',
  ...defaultWellsConfig,
  seismic: {
    disabled: true,
  },
};

export default defaultConfig;
