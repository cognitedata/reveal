import { TenantConfig } from 'tenants/types';

const defaultConfig: TenantConfig = {
  map: {
    zoom: 3.5,
    center: [18.5, 61],
    maxBounds: [
      [-31, 27],
      [64, 80],
    ],
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
