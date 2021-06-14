import { usePermissions } from '@cognite/sdk-react-query-hooks';

type Permission = {
  label: string;
  hasPermission?: boolean;
};

export const useAllNeededPermissions = () => {
  const { data: filesWritePermission } = usePermissions('filesAcl', 'WRITE');
  const { data: filesReadPermission } = usePermissions('filesAcl', 'READ');
  const { data: eventsWritePermission } = usePermissions('eventsAcl', 'WRITE');
  const { data: eventsReadPermission } = usePermissions('eventsAcl', 'READ');
  const { data: assetsReadPermission } = usePermissions('assetsAcl', 'READ');
  const { data: dsReadPermission } = usePermissions('datasetsAcl', 'READ');
  const { data: groupsListPermission } = usePermissions('groupsAcl', 'LIST');
  const { data: groupsReadPermission } = usePermissions('groupsAcl', 'READ');

  const allPermissions: Permission[] = [
    { label: 'files:write', hasPermission: filesWritePermission },
    { label: 'files:read', hasPermission: filesReadPermission },
    { label: 'events:write', hasPermission: eventsWritePermission },
    { label: 'events:read', hasPermission: eventsReadPermission },
    { label: 'assets:read', hasPermission: assetsReadPermission },
    { label: 'datasets:read', hasPermission: dsReadPermission },
    {
      label: !groupsReadPermission ? 'groups:read' : 'groups:list',
      hasPermission: groupsReadPermission || groupsListPermission,
    },
  ];
  return allPermissions;
};

export const useMissingPermissions = () => {
  const allPermissions = useAllNeededPermissions();
  const missingPermissions = allPermissions
    .filter((permission) => !permission.hasPermission)
    .map((permission) => permission.label);
  return missingPermissions;
};
