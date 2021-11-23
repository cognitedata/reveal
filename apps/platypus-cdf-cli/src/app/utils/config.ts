import Conf from 'conf';
import { ROOT_CONFIG_KEY, LOGIN_STATUS, AUTH_CONFIG } from '../constants';
import { ProjectConfig } from '../types';
let config: Conf<Record<string, unknown>>;

export const getConfig = () => config;

export const setConfig = (newConfig: Conf<Record<string, unknown>>) => {
  config = newConfig;
};

export const getProjectConfig = (): ProjectConfig => {
  return config.get(ROOT_CONFIG_KEY.AUTH) as ProjectConfig;
};

export const setProjectConfig = (arg: ProjectConfig, token: string) => {
  const { clientId, clientSecret, cluster, tenant, project, authType, apiKey } =
    arg;
  setProjectConfigItem(ROOT_CONFIG_KEY.AUTH, {
    [AUTH_CONFIG.LOGIN_STATUS]: LOGIN_STATUS.SUCCESS,
    [AUTH_CONFIG.AUTH_TOKEN]: token,
    [AUTH_CONFIG.CLIENT_SECRET]: clientSecret,
    [AUTH_CONFIG.CLIENT_ID]: clientId,
    [AUTH_CONFIG.CLUSTER]: cluster,
    [AUTH_CONFIG.TENANT]: tenant,
    [AUTH_CONFIG.PROJECT]: project,
    [AUTH_CONFIG.AUTH_TYPE]: authType,
    [AUTH_CONFIG.API_KEY]: apiKey,
  });
};

export const setProjectConfigItem = (key: string, value: unknown): void => {
  if (!value) {
    return config.delete(key);
  }
  config.set(key, value);
};
