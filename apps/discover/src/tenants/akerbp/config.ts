import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  searchableLayerTitle: 'Search in AkerBP licenses',
  map: {
    zoom: 4,
    center: [0, 68],
    maxBounds: [
      [-55, 27],
      [84, 80],
    ],
  },
  documents: {
    defaultLimit: 100,
    extractByFilepath: true,
    filters: {
      sourceFile: {
        datasetId: { in: [7915249683971782, 1322531845625181] },
      },
    },
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
    disabled: true,
    filters: {
      source: 'DISKOS',
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
  },
  azureConfig: {
    instrumentationKey: 'b90f62cf-5eee-45e8-839a-2c3e84f82399',
  },
};

export default defaultConfig;
