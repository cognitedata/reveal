import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  map: {
    zoom: 6,
    center: [5, 61],
  },
  documents: {
    disabled: false,
  },
  seismic: {
    metadata: {
      // [field from api result]: [display value]
      name: { displayName: 'Name', display: true },
    },
  },
  wells: {
    disabled: true,
  },
  sideBar: 2,
};

export default defaultConfig;
