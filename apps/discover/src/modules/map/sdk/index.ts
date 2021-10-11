import {
  CogniteGeospatialClient,
  GeometryRel,
  Metadata,
  GeometryType,
  SearchResult,
} from '@cognite/geospatial-sdk-js';

import { SIDECAR } from 'constants/app';

const { cdfCluster } = SIDECAR;

type FindSpatial = (args: {
  layer: string;
  // eslint-disable-next-line camelcase
  geometry_rel?: GeometryRel;
  name?: string;
  assetIds?: Array<number>;
  attributes?: Array<string>;
  metadata?: Metadata;
  source?: string;
  externalIdPrefix?: string;
  outputGeometry?: GeometryType;
  outputCRS?: string;
  limit?: number;
  cursor?: string;
}) => Promise<SearchResult>;

interface GeospatialSDK {
  createSpatial: (x: any) => any;
  findSpatial: FindSpatial;
  getLayerItems: (x: any) => any;
  getCoverage: (x: any) => any;
  getPointCloud: (x: any) => any;
}

const geospatialSDK: {
  client?: GeospatialSDK;
} = {
  client: undefined,
};

export const authenticateGeospatialSDK = (project: string, token: string) => {
  if (geospatialSDK.client) {
    return;
  }

  geospatialSDK.client = CogniteGeospatialClient({
    project,
    token,
    api_key: process.env.REACT_APP_API_KEY,
    api_url: `${cdfCluster}.cognitedata.com`,
    debug: true,
  });
};

export const getGeospatialSDKClient = () => {
  return geospatialSDK.client;
};
