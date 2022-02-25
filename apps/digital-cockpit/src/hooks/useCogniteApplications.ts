import {
  allApplications as allCogniteApplications,
  clusterPlaceholder,
} from 'constants/applications';

import { useContext, useMemo } from 'react';
import sidecar from 'utils/sidecar';
import { useSelector } from 'react-redux';
import { getConfigState } from 'store/config/selectors';
import { TenantContext } from 'providers/TenantProvider';

function useCogniteApplications() {
  const { applications: activeApplicationKeys = [] } =
    useSelector(getConfigState);
  const tenant = useContext(TenantContext);

  const allApplications = useMemo(
    () =>
      allCogniteApplications.map((app) => ({
        ...app,
        url:
          // add cluster to the url by replacing the placeholder
          (
            app.urlTemplate?.replace(
              clusterPlaceholder,
              sidecar.cdfCluster ? `.${sidecar.cdfCluster}` : ''
            ) || app.url
          )
            // add tenant name
            .concat(`/${tenant}`),
      })),
    [sidecar, allCogniteApplications, tenant]
  );

  const activeApplications = useMemo(() => {
    return allApplications.filter((app) =>
      activeApplicationKeys.includes(app.key)
    );
  }, [allApplications, activeApplicationKeys]);

  return { allApplications, activeApplications };
}

export default useCogniteApplications;
