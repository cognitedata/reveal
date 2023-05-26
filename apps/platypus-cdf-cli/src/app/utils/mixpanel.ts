import { init as MixPanelInit } from 'mixpanel';

import { ROOT_CONFIG_KEY } from '../constants';

import { getConfig } from './config';

// https://cognitedata.atlassian.net/wiki/spaces/CE/pages/3929277073/User+Metrics+-+Mixpanel
type MixpanelKey = 'CLI.DataModel.ErrorMessage' | 'CLI.Command';

const getMixpanel = () => {
  const globalConfig = getConfig();
  const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);

  const mixpanel = MixPanelInit('c1cbbc01f5a5c2384f646acae64716f2');
  mixpanel.people.set(globalConfig.get(ROOT_CONFIG_KEY.UID), {
    project: authConfig?.project,
    cluster: authConfig?.cluster,
  });
  return mixpanel;
};

export const track = (key: MixpanelKey, extra?: any) => {
  const globalConfig = getConfig();
  const authConfig = globalConfig.get(ROOT_CONFIG_KEY.AUTH);
  getMixpanel().track(key, {
    project: authConfig?.project,
    cluster: authConfig?.cluster,
    ...extra,
  });
};
