import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  wells: {
    trajectory: {
      enabled: true,
    },
  },
  azureConfig: {
    instrumentationKey: 'b90f62cf-5eee-45e8-839a-2c3e84f82399',
  },
};

export default defaultConfig;
