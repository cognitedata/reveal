import { Logger } from '@platypus/platypus-core';
import { AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
  logger: Logger;
};

export type LoginArgs = BaseArgs & {
  project: string;
  clientId: string;
  clientSecret?: string;
  tenant: string;
  cluster: string;
  authType: AUTH_TYPE;
  apiKey: string;
};

export interface ProjectConfig extends Omit<LoginArgs, keyof BaseArgs> {
  loginStatus: LOGIN_STATUS;
  authToken: string;
}
