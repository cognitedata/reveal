import { usePermissionsContext } from 'providers/ProvidePermissions';

type Permissions = {
  canReadReports: boolean;
  canWriteReports: boolean;
};

const EVENTS = 'events';

export const useReportPermissions = (): Permissions => {
  const currentPermissions = usePermissionsContext();

  const permissions: Permissions = {
    canReadReports: false,
    canWriteReports: false,
  };

  const eventsAccess = currentPermissions.find(
    (permission) => permission.name === EVENTS
  );

  if (eventsAccess) {
    if (!eventsAccess.missing.includes('READ')) {
      permissions.canReadReports = true;
    }
    if (!eventsAccess.missing.includes('WRITE')) {
      permissions.canWriteReports = true;
    }
  }
  return permissions;
};
