import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

type Permission = {
  label: string;
  hasPermission?: boolean;
};

export const useAllNeededPermissions = () => {
  const { flow } = getFlow();
  const { data: filesWritePermission } = usePermissions(
    flow,
    'filesAcl',
    'WRITE'
  );
  const { data: filesReadPermission } = usePermissions(
    flow,
    'filesAcl',
    'READ'
  );
  // TODO: remove events:read as required permission once annotation migration is complete
  const { data: eventsWritePermission } = usePermissions(
    flow,
    'eventsAcl',
    'WRITE'
  );
  const { data: eventsReadPermission } = usePermissions(
    flow,
    'eventsAcl',
    'READ'
  );
  const { data: annotationsWritePermission } = usePermissions(
    flow,
    'annotationsAcl',
    'WRITE'
  );
  const { data: assetsReadPermission } = usePermissions(
    flow,
    'assetsAcl',
    'READ'
  );
  const { data: dsReadPermission } = usePermissions(
    flow,
    'datasetsAcl',
    'READ'
  );
  const { data: groupsListPermission } = usePermissions(
    flow,
    'groupsAcl',
    'LIST'
  );
  const { data: groupsReadPermission } = usePermissions(
    flow,
    'groupsAcl',
    'READ'
  );
  const { data: labelsReadAcl } = usePermissions(flow, 'labelsAcl', 'READ');
  const { data: labelsWriteAcl } = usePermissions(flow, 'labelsAcl', 'WRITE');

  const allPermissions: Permission[] = [
    { label: 'files:write', hasPermission: filesWritePermission },
    { label: 'files:read', hasPermission: filesReadPermission },
    { label: 'annotations:write', hasPermission: annotationsWritePermission },
    { label: 'events:write', hasPermission: eventsWritePermission },
    { label: 'events:read', hasPermission: eventsReadPermission },
    { label: 'assets:read', hasPermission: assetsReadPermission },
    { label: 'datasets:read', hasPermission: dsReadPermission },
    { label: 'labels:read', hasPermission: labelsReadAcl },
    { label: 'labels:write', hasPermission: labelsWriteAcl },
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
