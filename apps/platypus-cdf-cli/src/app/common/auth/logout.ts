import { ROOT_CONFIG_KEY } from '../../constants';
import { setProjectConfigItem } from '../../utils/config';
import { DEBUG as _DEBUG } from '../../utils/logger';

const DEBUG = _DEBUG.extend('common:auth:logout');

export default () => {
  DEBUG(`Clearing the global user config for key:${ROOT_CONFIG_KEY.AUTH}`);
  setProjectConfigItem(ROOT_CONFIG_KEY.AUTH, undefined);
};
