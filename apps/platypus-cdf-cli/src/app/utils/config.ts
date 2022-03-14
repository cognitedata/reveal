import Conf from 'conf';
import { v4 } from 'uuid';
import { CONSTANTS, ROOT_CONFIG_KEY } from '../constants';
import { ProjectConfig } from '../types';
let config: Conf<ConfType>;

export const getConfig = () => {
  if (!config) {
    // loads global config first
    config = new Conf({
      projectName: CONSTANTS.APP_ID,
      configName: 'cdf-credentials',
      defaults: {
        [ROOT_CONFIG_KEY.TELEMETRY_DISABLED]: false,
        [ROOT_CONFIG_KEY.UID]: v4(),
        [ROOT_CONFIG_KEY.AUTO_CHECK_FOR_UPDATES]: true,
      } as ConfType,
    });
  }
  return config;
};

type ConfType = {
  [ROOT_CONFIG_KEY.AUTO_CHECK_FOR_UPDATES]?: boolean;
  [ROOT_CONFIG_KEY.TELEMETRY_DISABLED]?: boolean;
  [ROOT_CONFIG_KEY.UID]?: string;
  [ROOT_CONFIG_KEY.AUTH]?: ProjectConfig;
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
  key: ROOT_CONFIG_KEY.AUTH,
  value: ProjectConfig
): void => {
  if (!value) {
    return config.delete(key);
  }
  config.set(key, value);
};
