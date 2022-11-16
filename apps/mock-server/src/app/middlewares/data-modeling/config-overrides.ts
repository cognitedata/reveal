import { CdfApiConfig } from '../../types';
import { fetchDataModelsRequestTransformers } from './dms/request-transformers/data-models-request-transformers';

export const fdmConfigOverrides = {
  ignoreUrlPatterns: ['/models/instances/delete$', '/models/instances/ingest'],
  urlRewrites: {
    // DMS V3
    '/models/spaces': '/dmsV3Spaces',
    '/models/spaces/byids': '/dmsV3Spaces',
    '/models/spaces/delete': '/dmsV3Spaces',
    '/models/spaces/search': '/dmsV3Spaces',
    '/models/:resource/list': '/:resource',
    '/models/:resource/byids': '/:resource',
    '/models/:resource/search': '/:resource',
    '/models/:resource/delete': '/:resource',
    '/models/:resource/:id': '/:resource/:id',
    '/models/:resource': '/:resource',
  },
  endpoints: {
    '/models/datamodels': {
      requestTransformer: fetchDataModelsRequestTransformers,
    },
    '/models/datamodels/byids': {
      requestTransformer: fetchDataModelsRequestTransformers,
    },
  },
} as CdfApiConfig;
