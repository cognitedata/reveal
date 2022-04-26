import { defaultWellsConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  // searchableLayerTitle: '',
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
    instrumentationKey: '27e0a856-2390-4089-9f91-6282d3ef6d29',
  },
};

export default defaultConfig;
