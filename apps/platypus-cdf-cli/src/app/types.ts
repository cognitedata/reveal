import { Logger } from '@platypus/platypus-core';
import { AUTH_CONFIG, AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
  logger: Logger;
};

export type LoginArgs = BaseArgs & {
  [AUTH_CONFIG.PROJECT]: string;
  [AUTH_CONFIG.CLIENT_ID]: string;
  [AUTH_CONFIG.CLIENT_SECRET]?: string;
  [AUTH_CONFIG.TENANT]: string;
  [AUTH_CONFIG.CLUSTER]: string;
  [AUTH_CONFIG.AUTH_TYPE]: AUTH_TYPE;
  [AUTH_CONFIG.API_KEY]: string;
};

export interface ProjectConfig extends Omit<LoginArgs, keyof BaseArgs> {
  [AUTH_CONFIG.LOGIN_STATUS]: LOGIN_STATUS;
  [AUTH_CONFIG.AUTH_TOKEN]: string;
}
