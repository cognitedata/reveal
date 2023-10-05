import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
const { flow } = getFlow();

export const useThreeDPermissions = () => {
  const { data: hasThreeDReadCapability } = usePermissions(
    flow as any,
    'threedAcl',
    'READ'
  );
  const { data: hasThreeDCreateCapability, isFetched: isFetchedThreeDCreate } =
    usePermissions(flow as any, 'threedAcl', 'CREATE');
  const { data: hasFilesWriteCapability, isFetched: isFetchedFilesWrite } =
    usePermissions(flow as any, 'filesAcl', 'WRITE');

  const { data: hasFilesReadCapability } = usePermissions(
    flow as any,
    'filesAcl',
    'READ'
  );

  const { data: hasLabelsWriteCapability } = usePermissions(
    flow as any,
    'labelsAcl',
    'WRITE'
  );

  const { data: hasLabelsReadCapability } = usePermissions(
    flow as any,
    'labelsAcl',
    'READ'
  );

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
