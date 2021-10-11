import { defaultWellsConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  // searchableLayerTitle: '',
  map: {
    zoom: 6,
    center: [-90, 27],
    maxBounds: [
      [-101, 18],
      [-70, 40],
    ],
    cluster: true,
  },
  documents: {
    defaultLimit: 100,
    filters: {},
    wellboreSchematics: {
      supportedFileTypes: ['PDF', 'IMAGE'],
    },
  },
  ...defaultWellsConfig,
  seismic: {
    disabled: true,
  },
  companyInfo: {
    name: 'BP',
    logo: 'owa-test.png',
  },
  hideFilterCount: true,
  azureConfig: {
    enabled: true,
    instrumentationKey: '2e2d1c8b-3233-4130-976f-e8c912a66fd7',
  },
  showDynamicResultCount: true,
};

export default defaultConfig;
