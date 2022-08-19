import { useLocation } from 'react-router-dom';

import { Mixpanel, TRACKING_TOKENS } from '@platypus-app/utils/mixpanel';
import { getCluster, getEnv } from '@cognite/cdf-utilities';
import { useEffect } from 'react';

export const useMixpanel = () => {
  const { pathname } = useLocation();
  const cluster = getCluster();
  const env = getEnv();

  useEffect(() => {
    Mixpanel.track(TRACKING_TOKENS.PageView, {
      url: pathname,
      env,
      cluster,
    });
  }, [pathname, cluster, env]);
};
