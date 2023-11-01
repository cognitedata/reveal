import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { useReverseLookupAnnotationsQuery } from '../../../annotations/service/queries/useReverseLookupAnnotationsQuery';
import { queryKeys } from '../../../queryKeys';
import { fetchPointCloudDetailMappings } from '../network/fetchPointCloudDetailMappings';
import { DetailedMapping } from '../types';

export function usePointcloudsByAssetId(assetId: number) {
  const sdk = useSDK();
  const filter = {
    annotatedResourceType: 'threedmodel',
    data: {
      assetRef: {
        id: assetId,
      },
    },
  } as const;
  const { data } = useReverseLookupAnnotationsQuery({ filter });
  const pointCloudModelIds = data.filter(
    (annotationAssetRef): annotationAssetRef is { id: number } =>
      annotationAssetRef.id !== undefined
  );
  return useQuery<DetailedMapping[]>(
    queryKeys.retrieveAssetReverseAnnotationLookup(assetId),
    () => fetchPointCloudDetailMappings(sdk, pointCloudModelIds),
    { enabled: pointCloudModelIds.length > 0 }
  );
}
