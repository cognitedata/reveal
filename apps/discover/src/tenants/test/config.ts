import { TenantConfig } from 'tenants/types';

const defaultConfig: TenantConfig = {
  map: {
    zoom: 3.5,
    center: [18.5, 61],
  },
  documents: {},
  wells: {
    trajectory: {
      enabled: true,
    },
    casing: {
      enabled: true,
    },
    logs: {
      enabled: true,
    },
  },
};

export default defaultConfig;
