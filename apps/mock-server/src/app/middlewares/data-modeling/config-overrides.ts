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
    '/models/views': '/dmsV3Views',
    '/models/views/byids': '/dmsV3Views',
    '/models/views/delete': '/dmsV3Views',
    '/models/containers': '/dmsV3Containers',
    '/models/containers/byids': '/dmsV3Containers',
    '/models/containers/delete': '/dmsV3Containers',
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
