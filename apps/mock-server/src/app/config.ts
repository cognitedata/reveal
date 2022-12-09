import { CdfApiConfig } from './types';

export const config = {
  defaultApiEndpoints: [
    'assets',
    'events',
    'datasets',
    'timeseries',
    'files',
    'templategroups',
    'templates',
    'groups',
    'transformations',
  ],
  builtInTypes: {
    Asset: 'assets',
    TimeSeries: 'timeseries',
    SyntheticTimeSeries: 'timeseries',
  },
  whitelistedEndpointEndings: ['/list', '/search', '/byids', '/filter'],
  ignoreUrlPatterns: [
    '/templategroups/upsert',
    '/templategroups/.*/versions/upsert',
    '/templategroups/.*/versions/.*/graphql',
    '/datamodelstorage/nodes/delete$',
    '/datamodelstorage/nodes$',
    '/datamodelstorage/edges/delete$',
    '/datamodelstorage/edges$',
    '/models/instances/ingest',
    '/schema/graphql',
    '/schema/api/.*/graphql',
    '/timeseries/data/list',
    '/files/downloadLink',
    '/files/gcs_proxy/cognitedata-file-storage/*',
  ],
  urlRewrites: {
    '/api/v1/projects/:project/*': '/$2',
    // DMS V2
    '/datamodelstorage/:resource/list': '/:resource',
    '/datamodelstorage/:resource/byids': '/:resource',
    '/datamodelstorage/:resource/search': '/:resource',
    '/datamodelstorage/spaces/delete': '/spaces',
    '/datamodelstorage/models/delete': '/models',
    '/datamodelstorage/spaces': '/spaces',
    '/datamodelstorage/models': '/models',

    '/:resource/list': '/:resource',
    '/:resource/search': '/:resource',
    '/:resource/byids': '/:resource',
    '/transformations/filter': '/transformations',
    '/templategroups/:templategroups_id/versions/list':
      '/templates?templategroups_id=:templategroups_id&_sort=version&_order=desc',
  },
} as CdfApiConfig;
