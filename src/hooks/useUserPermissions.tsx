import { usePermissions } from '@cognite/sdk-react-query-hooks';

type Permission = {
  label: string;
  hasPermission?: boolean;
};

export const useUserPermissions = () => {
  const { data: filesWritePermission, isLoading: filesWriteLoading } =
    usePermissions('filesAcl', 'WRITE');
  const { data: filesReadPermission, isLoading: filesReadLoading } =
    usePermissions('filesAcl', 'READ');
  const { data: labelsWriteAcl, isLoading: labelsWriteLoading } =
    usePermissions('labelsAcl', 'WRITE');
  const { data: labelsReadAcl, isLoading: labelsReadLoading } = usePermissions(
    'labelsAcl',
    'READ'
  );
  const { data: documentPipelinesWrite, isLoading: pipelinesWriteLoading } =
    usePermissions('documentPipelinesAcl', 'WRITE');
  const { data: documentPipelinesRead, isLoading: pipelinesReadLoading } =
    usePermissions('documentPipelinesAcl', 'READ');

  const isLoading =
    filesWriteLoading &&
    filesReadLoading &&
    labelsWriteLoading &&
    labelsReadLoading &&
    pipelinesWriteLoading &&
    pipelinesReadLoading;

  if (isLoading) {
    return {
      isLoading,
    };
  }

  const allPermissions: Permission[] = [
    { label: 'files:READ', hasPermission: filesReadPermission },
    { label: 'files:WRITE', hasPermission: filesWritePermission },
    { label: 'documentPipelines:READ', hasPermission: documentPipelinesRead },
    { label: 'documentPipelines:WRITE', hasPermission: documentPipelinesWrite },
    { label: 'labels:READ', hasPermission: labelsReadAcl },
    { label: 'labels:WRITE', hasPermission: labelsWriteAcl },
  ];

  const missingPermissions = allPermissions
    .filter((permission) => !permission.hasPermission)
    .map((permission) => permission.label);

  return {
    allPermissions,
    missingPermissions,
  };
};
