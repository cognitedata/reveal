export enum AUTH_TYPE {
  CLIENT_SECRET = 'clientSecret',
  LEGACY = 'legacy',
}

export enum LOGIN_STATUS {
  SUCCESS = 'success',
  UNAUTHENTICATED = 'unauthenticated',
}

export enum ROOT_CONFIG_KEY {
  AUTH = 'auth',
}

export enum AUTH_CONFIG {
  AUTH_TOKEN = 'authToken',
  AUTH_TYPE = 'authType',
  LOGIN_STATUS = 'loginStatus',
  CLIENT_ID = 'clientId',
  CLIENT_SECRET = 'clientSecret',
  TENANT = 'tenant',
  CLUSTER = 'cluster',
  PROJECT = 'project',
  API_KEY = 'apiKey',
}
