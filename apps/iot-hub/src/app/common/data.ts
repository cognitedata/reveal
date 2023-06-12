import { ExtractorConfig, IoTDevice } from './types';

export const devices: IoTDevice[] = [
  {
    // Make this the same as ext pipeline id!
    id: '3576',
    name: 'London Edge',
    latestResponse: '2021-09-01T12:00:00Z',
    modules: [
      {
        name: '$edgeAgent',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: '$edgeHub',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'grafana',
        type: 'custom',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'opcua-extractor',
        type: 'extractor',
        deployed: true,
        reported: true,
        status: true,
      },
    ],
  },
  {
    // Make this the same as ext pipeline id!
    id: '3578',
    name: 'London Edge 2',
    latestResponse: '2023-05-01T12:00:00Z',
    modules: [
      {
        name: '$edgeAgent',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: '$edgeHub',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'opcua-extractor',
        type: 'extractor',
        deployed: true,
        reported: true,
        status: true,
      },
    ],
  },
];

// by default, all extractors be given these credentials
export type defaultCredentitals =
  | 'COGNITE_EXTRACTION_PIPELINE' // created on the fly
  | 'COGNITE_TOKEN_URL' // from sdk (i think?)
  | 'COGNITE_BASE_URL' // from sdk (i think?)
  | 'COGNITE_SCOPE' // from sdk (i think?)
  | 'COGNITE_PROJECT' // from sdk (i think?)
  | 'DATA_SET_EXTERNAL_ID' // chosen by user
  | 'COGNITE_CLIENT_ID' // chosen by user
  | 'COGNITE_CLIENT_SECRET'; // chosen by user

export const configs: { [key in string]: ExtractorConfig } = {
  'cognite-opcua': {
    dockerImage: 'cognite/opcua-extractor-net:2.19.0',
    requiredCredentials: ['OPCUA_ENDPOINT_URL'],
    defaultCredentials: {
      // EXTRACTOR_PIPELINE_CONFIG_REVISION: '45',
    },
    fixedCredentials: {
      OPCUA_CONFIG_DIR: '/config_remote',
    },
    defaultConfig: `# By default this will extract the OPC-UA node hierarchy to the CDF asset hierarchy
    # and stream live data to timeseries. With proper configuration the extractor can
    # read string timeseries, events and historical data.
    
    # Version of the config schema
    version: 1
    
    source:
        # The URL of the OPC-UA server to connect to
        endpoint-url: "\${OPCUA_ENDPOINT_URL}"
    
    cognite:
        # The project to connect to in the API, uses the environment variable COGNITE_PROJECT.
        project: "\${COGNITE_PROJECT}"
        # Data set
        data-set:
            external-id: "\${DATA_SET_EXTERNAL_ID}"
        # Cognite base url
        host: "\${COGNITE_BASE_URL}"
        # See the example config for the full list of options.
        idp-authentication:
            # URL to fetch tokens from. Either this or tenant must be present.
            token-url: \${COGNITE_TOKEN_URL}
            # Application Id
            client-id: \${COGNITE_CLIENT_ID}
            # Client secret
            secret: \${COGNITE_CLIENT_SECRET}
            # List of resource scopes, ex:
            # scopes:
            #   - scopeA
            #   - scopeB
            scopes:
              - \${COGNITE_SCOPE}
    
            audience: \${COGNITE_AUDIENCE}
            # Which implementation to use in the authenticator. One of
            # MSAL (recommended) - Microsoft Authentication Library, works only with authority/tenant
            # Basic - Post to authentication endpoint and parse JSON response, works with both authority/tenant and token-url
            # Default is MSAL
            implementation: Basic
    
        extraction-pipeline:
            external-id: \${COGNITE_EXTRACTION_PIPELINE}`,
  },
};
