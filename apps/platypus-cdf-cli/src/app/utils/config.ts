import Conf from 'conf';
import { Arguments } from 'yargs';
import { AUTH_TYPE, CONFIG_KEY, LOGIN_STATUS } from '../constants';
import { LoginArgs, ProjectConfig } from '../types';
let config: Conf<Record<string, unknown>>;

export const getConfig = () => config;

export const setConfig = (newConfig: Conf<Record<string, unknown>>) => {
  config = newConfig;
};

export const getProjectConfig = () => {
  const authArgs = {
    loginStatus: config.get(CONFIG_KEY.LOGIN_STATUS),
    clientId: config.get(CONFIG_KEY.CLIENT_ID),
    clientSecret: config.get(CONFIG_KEY.CLIENT_SECRET),
    cluster: config.get(CONFIG_KEY.CLUSTER),
    project: config.get(CONFIG_KEY.PROJECT),
    tenant: config.get(CONFIG_KEY.TENANT),
    authToken: config.get(CONFIG_KEY.AUTH_TOKEN),
    authType: config.get(CONFIG_KEY.AUTH_TYPE),
  } as ProjectConfig;

  return authArgs;
};

// TODO: refactor this, use project config instead
export const setProjectConfig = (arg: Arguments<LoginArgs>, token: string) => {
  const { clientId, clientSecret, cluster, tenant, project } = arg;
  config.set(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.SUCCESS);
  config.set(CONFIG_KEY.AUTH_TOKEN, token);
  config.set(CONFIG_KEY.CLIENT_SECRET, clientSecret ?? '');
  config.set(CONFIG_KEY.CLIENT_ID, clientId);
  config.set(CONFIG_KEY.CLUSTER, cluster);
  config.set(CONFIG_KEY.TENANT, tenant);
  config.set(CONFIG_KEY.PROJECT, project);
  config.set(CONFIG_KEY.AUTH_TYPE, AUTH_TYPE.CLIENT_SECRET);
};

export const setProjectConfigItem = (key: string, value: unknown): void => {
  config.set(key, value);
};
