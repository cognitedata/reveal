import { getCluster, getEnv } from '@cognite/cdf-utilities';
import { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// This hook is for setting up the fusion query(env & cluster)
// for the app so it can read current project in fusion.
// Otherwise it will give 401 error when trying to read project.

export function useFusionQuery() {
  const cluster = getCluster();
  const env = getEnv();
  const location = useLocation();
  const history = useHistory();
  const ref = useRef<null | Record<string, string>>(null);
  useEffect(() => {
    if (env && cluster) {
      ref.current = {
        cluster,
        env,
      };
    }
  }, [cluster, env]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!env && !cluster && ref.current) {
      params.set('cluster', ref.current.cluster);
      params.set('env', ref.current.env);
      history.replace('?' + params.toString());
    }
  });
}
