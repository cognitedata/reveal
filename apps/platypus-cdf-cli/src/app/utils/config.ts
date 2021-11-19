import Conf from 'conf';
import { CONFIG_KEY, LOGIN_STATUS } from '../constants';
import { ProjectConfig } from '../types';
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
    apiKey: config.get(CONFIG_KEY.API_KEY),
  } as ProjectConfig;

  return authArgs;
};

export const setProjectConfig = (arg: ProjectConfig, token: string) => {
  const { clientId, clientSecret, cluster, tenant, project, authType, apiKey } =
    arg;
  setProjectConfigItem(CONFIG_KEY.LOGIN_STATUS, LOGIN_STATUS.SUCCESS);
  setProjectConfigItem(CONFIG_KEY.AUTH_TOKEN, token);
  setProjectConfigItem(CONFIG_KEY.CLIENT_SECRET, clientSecret);
  setProjectConfigItem(CONFIG_KEY.CLIENT_ID, clientId);
  setProjectConfigItem(CONFIG_KEY.CLUSTER, cluster);
  setProjectConfigItem(CONFIG_KEY.TENANT, tenant);
  setProjectConfigItem(CONFIG_KEY.PROJECT, project);
  setProjectConfigItem(CONFIG_KEY.AUTH_TYPE, authType);
  setProjectConfigItem(CONFIG_KEY.API_KEY, apiKey);
};

export const setProjectConfigItem = (key: string, value: unknown): void => {
  if (!value) {
    return config.delete(key);
  }
  config.set(key, value);
};
