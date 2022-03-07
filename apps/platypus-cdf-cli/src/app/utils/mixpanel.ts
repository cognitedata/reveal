import { getConfig } from './config';
import { init as MixPanelInit } from 'mixpanel';
import { ROOT_CONFIG_KEY } from '../constants';

export const getMixpanel = () => {
  const globalConfig = getConfig();
  const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);

  const mixpanel = MixPanelInit('c1cbbc01f5a5c2384f646acae64716f2');
  mixpanel.people.set(globalConfig.get(ROOT_CONFIG_KEY.UID), {
    project: authConfig.project,
    cluster: authConfig.cluster,
  });
  return mixpanel;
};
