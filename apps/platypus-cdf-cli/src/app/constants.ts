export enum AUTH_TYPE {
  DEVICE_CODE = 'oauth',
  CLIENT_SECRET = 'clientSecret',
}

export enum LOGIN_STATUS {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum CONFIG_KEY {
  AUTH_TOKEN = 'authToken',
  AUTH_TYPE = 'authType',
  LOGIN_STATUS = 'loginStatus',
  CLIENT_ID = 'clientId',
  CLIENT_SECRET = 'clientSecret',
  TENANT = 'tenant',
  CLUSTER = 'cluster',
  PROJECT = 'project',
}
