import { usePermissions } from '@cognite/sdk-react-query-hooks';

export const useThreeDPermissions = () => {
  const { data: hasThreeDReadCapability } = usePermissions('threedAcl', 'READ');
  const { data: hasThreeDCreateCapability, isFetched: isFetchedThreeDCreate } =
    usePermissions('threedAcl', 'CREATE');
  const { data: hasFilesWriteCapability, isFetched: isFetchedFilesWrite } =
    usePermissions('filesAcl', 'WRITE');

  const { data: hasFilesReadCapability } = usePermissions('filesAcl', 'READ');

  const { data: hasLabelsWriteCapability } = usePermissions(
    'labelsAcl',
    'WRITE'
  );

  const { data: hasLabelsReadCapability } = usePermissions('labelsAcl', 'READ');

  return {
    hasThreeDReadCapability,
    hasThreeDCreateCapability,
    hasFilesWriteCapability,
    hasFilesReadCapability,
    hasLabelsWriteCapability,
    hasLabelsReadCapability,
    isFetchedThreeDCreate,
    isFetchedFilesWrite,
  };
};
