import { AUTH_TYPE, LOGIN_STATUS } from './constants';

export type BaseArgs = {
  appId: string;
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
