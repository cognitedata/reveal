import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import { getCluster, getEnv, getProject } from '@cognite/cdf-utilities';

// This hook is for setting up the fusion query(env & cluster)
// for the app so it can read current project in fusion.
// Otherwise it will give 401 error when trying to read project.

export function useFusionQuery() {
  const cluster = getCluster();
  const env = getEnv();
  const project = getProject();
  const location = useLocation();

  const [, setSearchParams] = useSearchParams();

  const ref = useRef<null | Record<string, string>>(null);

  useEffect(() => {
    if (env && cluster) {
      ref.current = {
        cluster,
        env,
      };
    }
  }, [cluster, env, project]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!env && !cluster && ref.current) {
      params.set('cluster', ref.current.cluster);
      params.set('env', ref.current.env);
      /*
      use replace, otherwise we'll add an entry to the history stack after clicking a
      data model from the list, so the browser back button will take you back to the URL
      without the search params and they'll just be added again
      */
      setSearchParams(params, {
        replace: true,
      });
    }
  });
}
