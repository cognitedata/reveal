import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  searchableLayerTitle: 'Search in licenses',
  map: {
    zoom: 3.5,
    center: [18.5, 61],
  },
  seismic: {
    metadata: {
      // [field from api result]: [display value]
      'Data type': { displayName: 'Data type', display: true },
      'Data Description': { displayName: 'Data description​', display: true },
      'Survey Specific​': {
        displayName: 'Survey specific product​',
        display: true,
      },
      'First shot point​': { displayName: 'First shot point​', display: true },
      'Last shot point​': { displayName: 'Last shot point​', display: true },
      'Line length': { displayName: '2D line length​', display: true },
      'Shooting direction': {
        displayName: 'Shooting direction',
        display: true,
      },
    },
  },
};

export default defaultConfig;
