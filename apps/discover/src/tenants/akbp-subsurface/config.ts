import { defaultWellFilters } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  searchableLayerTitle: 'Search in AkerBP licenses',
  map: {
    zoom: 6,
    center: [10, 59],
    maxBounds: [
      [-31, 27],
      [64, 80],
    ],
  },
  seismic: {
    metadata: {
      // timeDepth: 'Time/Depth',
      // fileSize: 'File size',
      diskos_id: { display: true, displayName: 'File name' },
      dimension: { display: true, displayName: 'Survey type' },
      data_type: { display: true, displayName: 'Migration' },
      processing: { display: true, displayName: 'Processing' },
      processing_year: { display: true, displayName: 'Year' },
      offset: { display: true, displayName: 'Offset' },
      source: { display: true, displayName: 'Source' },
    },
  },
  wells: {
    filters: {
      parentExternalIds: ['MappedWells'],
    },
    wellbores: {
      fetch: (client, filters = {}) => {
        return client.assets.list({
          filter: {
            metadata: {
              type: 'wellbore',
            },
            ...filters,
          },
          limit: 1000,
        });
      },
    },
    ...defaultWellFilters,
  },
};

export default defaultConfig;
