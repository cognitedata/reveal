import Conf from 'conf';
import { ROOT_CONFIG_KEY } from '../constants';
import { ProjectConfig } from '../types';
let config: Conf<{ [ROOT_CONFIG_KEY.AUTH]?: ProjectConfig }>;

export const getConfig = () => config;

export const setConfig = (
  newConfig: Conf<{ [ROOT_CONFIG_KEY.AUTH]?: ProjectConfig }>
) => {
  config = newConfig;
};

export const getProjectConfig = (): ProjectConfig | undefined => {
  return config.get(ROOT_CONFIG_KEY.AUTH, undefined);
};

export const setProjectConfig = (args: Partial<ProjectConfig>) => {
  setProjectConfigItem(ROOT_CONFIG_KEY.AUTH, {
    ...getProjectConfig(),
    ...args,
  });
};

export const setProjectConfigItem = (
  key: ROOT_CONFIG_KEY,
  value: ProjectConfig
): void => {
  if (!value) {
    return config.delete(key);
  }
  config.set(key, value);
};
