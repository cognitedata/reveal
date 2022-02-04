export enum AUTH_TYPE {
  PKCE = 'interactive',
  CLIENT_SECRET = 'clientSecret',
  APIKEY = 'legacy',
}

export enum LOGIN_STATUS {
  SUCCESS = 'success',
  UNAUTHENTICATED = 'unauthenticated',
}

export enum ROOT_CONFIG_KEY {
  AUTH = 'auth',
}

export enum AUTH_CONFIG {
  MSAL_AUTH_CACHE = 'msalTokenCache',
  ACCOUNT_INFO = 'msalAccountInfo',
  AUTH_TYPE = 'authType',
  LOGIN_STATUS = 'loginStatus',
  CLIENT_ID = 'clientId',
  CLIENT_SECRET = 'clientSecret',
  TENANT = 'tenant',
  CLUSTER = 'cluster',
  PROJECT = 'project',
  API_KEY = 'apiKey',
}

export const CONSTANTS = {
  PROJECT_CONFIG_FILE_NAME: 'cdfrc.json',
  PROJECT_CONFIG_DEFAULT_SCHEMA_FILE_NAME: 'schema.graphql',
  MANUAL_WEBSITE: 'https://github.com/cognitedata/platypus',
  GRAPHQL_CODEGEN_PLUGINS_NAME: {
    TYPESCRIPT: 'typescript',
    TYPESCRIPT_OPERATIONS: 'typescript-operations',
    TYPESCRIPT_RESOLVERS: 'typescript-resolvers',
    TYPESCRIPT_REACT_APOLLO: 'typescript-react-apollo',
    TYPESCRIPT_APOLLO_ANGULAR: 'typescript-apollo-angular',
  },
};

export const SupportedGraphQLGeneratorPlugins = [
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT,
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_OPERATIONS,
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_RESOLVERS,
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_REACT_APOLLO,
  CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_APOLLO_ANGULAR,
];

export const SETTINGS = {
  TIMEOUT: 10 * 1000,
};
