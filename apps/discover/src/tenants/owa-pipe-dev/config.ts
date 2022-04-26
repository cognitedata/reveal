import { defaultWellsConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  // searchableLayerTitle: '',
  ...config, // Contain common configurations for all tenants
  map: {
    zoom: 6,
    center: [-90, 27],
  },
  documents: {
    defaultLimit: 100,
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
  azureConfig: {
    enabled: true,
    instrumentationKey: '2e2d1c8b-3233-4130-976f-e8c912a66fd7',
  },
};

export default defaultConfig;
