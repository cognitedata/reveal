import {
  allApplications as allCogniteApplications,
  clusterNoDotPlaceholder,
  clusterPlaceholder,
  tenantPlaceholder,
} from 'constants/applications';

import { useContext, useMemo } from 'react';
import sidecar from 'utils/sidecar';
import { useSelector } from 'react-redux';
import { getConfigState } from 'store/config/selectors';
import { TenantContext } from 'providers/TenantProvider';
import uniq from 'lodash/uniq';
import { ApplicationItem } from 'store/config/types';
import { useAuthContext } from '@cognite/react-container';

function useCogniteApplications() {
  const { client } = useAuthContext();
  const { applications: activeApplicationKeys = [] } =
    useSelector(getConfigState);
  const tenant = useContext(TenantContext);

  const mapURLTemplateToUrl = (app: ApplicationItem) => ({
    ...app,
    url:
      // add cluster to the url by replacing the placeholder
      app.urlTemplate
        ?.replace(
          clusterPlaceholder,
          sidecar.cdfCluster ? `.${sidecar.cdfCluster}` : ''
        )
        .replace(tenantPlaceholder, tenant)
        .replace(clusterNoDotPlaceholder, sidecar.cdfCluster || '') || app.url,
  });
  const allApplications = useMemo(
    () => allCogniteApplications.map<ApplicationItem>(mapURLTemplateToUrl),
    [sidecar, allCogniteApplications, tenant]
  );

  const getInstalledApplications = async () => {
    const installableApps = allCogniteApplications.filter(
      (app) => !!app.installable
    );
    const installedAppsPromise = installableApps.map(async (app) => {
      if (!app.installedCheckFunc || !client) return false;
      const isInstalled = await app.installedCheckFunc(client);
      return isInstalled ? app : false;
    });
    const installedApps = await Promise.all(installedAppsPromise);
    return (installedApps.filter(Boolean) as ApplicationItem[]).map(
      mapURLTemplateToUrl
    );
  };

  const allCategories = useMemo(
    () =>
      uniq(
        allCogniteApplications.map((app) => app.categories || []).flat()
        // eslint-disable-next-line no-nested-ternary
      ).sort((a, b) => (a === 'Featured' ? -1 : b === 'Featured' ? 1 : 0)),
    [allCogniteApplications]
  );

  const activeApplications = useMemo(() => {
    return allApplications
      .filter((app) => activeApplicationKeys.includes(app.key))
      .filter((app) => !app.installable);
  }, [allApplications, activeApplicationKeys]);

  return {
    allApplications,
    activeApplications,
    allCategories,
    getInstalledApplications,
  };
}

export default useCogniteApplications;
