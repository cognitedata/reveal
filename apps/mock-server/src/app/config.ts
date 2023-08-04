import { CdfApiConfig } from './types';

export const config = {
  defaultApiEndpoints: [
    'assets',
    'events',
    'datasets',
    'timeseries',
    'files',
    'groups',
    'transformations',
  ],
  builtInTypes: {
    Asset: 'assets',
    TimeSeries: 'timeseries',
    File: 'file',
    Sequence: 'sequence',
    SyntheticTimeSeries: 'timeseries',
  },
  whitelistedEndpointEndings: ['/list', '/search', '/byids', '/filter'],
  ignoreUrlPatterns: [
    '/models/instances/ingest',
    '/dml/graphql',
    '/userapis/spaces/.*/graphql',
    '/timeseries/data/list',
    '/files/downloadLink',
    '/files/gcs_proxy/cognitedata-file-storage/*',
  ],
  urlRewrites: {
    // '/api/v1/projects/:project$': '/projects',
    '/api/v1/projects/:project/*': '/$2',
    '/:resource/list': '/:resource',
    '/:resource/search': '/:resource',
    '/:resource/byids': '/:resource',
    '/transformations/filter': '/transformations',
  },
} as CdfApiConfig;
