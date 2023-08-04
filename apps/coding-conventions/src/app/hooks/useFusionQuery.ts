import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import { readLoginHints } from '@cognite/auth-react/src/lib/base';
import {
  getCluster,
  getEnv,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';

// This hook is for setting up the fusion query(env & cluster)
// for the app so it can read current project in fusion.
// Otherwise it will give 401 error when trying to read project.

const loginHints = readLoginHints() ?? {};

export function useFusionQuery() {
  const cluster = getCluster() ?? loginHints?.cluster;
  const env = getEnv();
  const project = getProject() ?? loginHints?.project;
  const idpInternalId = loginHints.idpInternalId;
  const organization = loginHints.organization;
  const location = useLocation();

  const [, setSearchParams] = useSearchParams();

  const ref = useRef<null | Record<string, string>>(null);

  useEffect(() => {
    if (isUsingUnifiedSignin()) {
      if (env && cluster && project && idpInternalId && organization) {
        ref.current = {
          cluster,
          env,
          project,
          idpInternalId,
          organization,
        };
      }
    } else {
      if (env && cluster) {
        ref.current = {
          cluster,
          env,
        };
      }
    }
  }, [cluster, env, idpInternalId, organization, project]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (isUsingUnifiedSignin()) {
      if (
        !env &&
        !cluster &&
        !project &&
        !idpInternalId &&
        !organization &&
        ref.current
      ) {
        params.set('cluster', ref.current.cluster);
        params.set('env', ref.current.env);
        params.set('project', ref.current.project);
        params.set('idpInternalId', ref.current.idpInternalId);
        params.set('organization', ref.current.organization);
        setSearchParams(params, {
          replace: true,
        });
      }
    } else {
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
    }
  });
}
