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
  builtInTypes: ['Asset'],
  whitelistedEndpointEndings: ['/list', '/search', '/byids'],
  ignoreUrlPatterns: [
    '/templategroups/upsert',
    '/templategroups/.*/versions/upsert',
    '/templategroups/.*/versions/.*/graphql',
    '/schema/graphql',
  ],
};
