export const config = {
  defaultApiEndpoints: [
    'assets',
    'events',
    'datasets',
    'timeseries',
    'files',
    'templategroups',
    'templates',
  ],
  builtInTypes: {
    Asset: 'assets',
    TimeSeries: 'timeseries',
    SyntheticTimeSeries: 'timeseries',
  },
  whitelistedEndpointEndings: ['/list', '/search', '/byids'],
  ignoreUrlPatterns: [
    '/templategroups/upsert',
    '/templategroups/.*/versions/upsert',
    '/templategroups/.*/versions/.*/graphql',
    '/schema/graphql',
    '/timeseries/data/list',
    '/files/downloadLink',
    '/files/gcs_proxy/cognitedata-file-storage/*',
  ],
};
