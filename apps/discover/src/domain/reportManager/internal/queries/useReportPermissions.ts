import { usePermissionsContext } from 'providers/ProvidePermissions';

import { ProjectConfigFeedback } from '@cognite/discover-api-types';
import { AclScopeAll, AclScopeEvents } from '@cognite/sdk';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';

type Permissions = {
  canReadReports: boolean;
  canWriteReports: boolean;
};

const hasValidDataset = (
  feedbackConfig?: ProjectConfigFeedback,
  eventsAccessScope?: AclScopeEvents
) => {
  return (
    feedbackConfig?.datasetId &&
    // if all events scope is provided then it overrides datasetScope
    // Hence, need to take care of both cases of all & datasetScope
    (Boolean((eventsAccessScope as AclScopeAll)?.all) ||
      // eslint-disable-next-line
      // @ts-ignore datasetId string cannot be of type number
      // (fault) receiving datasetId as string from token
      eventsAccessScope?.datasetScope?.ids?.includes(feedbackConfig?.datasetId))
  );
};

const EVENTS = 'events';

export const useReportPermissions = (): Permissions => {
  const currentPermissions = usePermissionsContext();
  const { data: feedbackConfig } = useProjectConfigByKey('feedback');

  const permissions: Permissions = {
    canReadReports: false,
    canWriteReports: false,
  };

  const eventsAccess = currentPermissions.find(
    (permission) => permission.name === EVENTS
  );

  if (eventsAccess) {
    if (hasValidDataset(feedbackConfig, eventsAccess.scope as AclScopeEvents)) {
      if (!eventsAccess.missing.includes('READ')) {
        permissions.canReadReports = true;
      }
      if (!eventsAccess.missing.includes('WRITE')) {
        permissions.canWriteReports = true;
      }
    }
  }
  return permissions;
};
