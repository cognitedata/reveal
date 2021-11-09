import { testAzureConfig } from 'tenants/config';
import { TenantConfig } from 'tenants/types';

import config from '../config';

const defaultConfig: TenantConfig = {
  ...config, // Contain common configurations for all tenants
  searchableLayerTitle: 'Searchable in test tenant',
  sideBar: 2,
  map: {
    zoom: 4,
    center: [12, 55],
    cluster: true,
  },
  seismic: {
    metadata: {
      // [field from api result]: [display value]
      dataSetName: { displayName: 'Name', display: true, source: '' },
      opendata: { displayName: 'Open data', display: true },
    },
  },
  companyInfo: {
    name: 'Cognite',
    logo: 'aa.png',
  },
  azureConfig: {
    ...testAzureConfig,
    enabled: false,
  },
  favorites: {
    showDownloadAllDocumentsButton: true,
  },
  showProjectConfig: true,
  documents: config?.documents
    ? {
        ...config.documents,
        mapLayerFilters: {
          fields: {
            labelAccessor: 'Field',
          },
        },
      }
    : undefined,
};

export default defaultConfig;
