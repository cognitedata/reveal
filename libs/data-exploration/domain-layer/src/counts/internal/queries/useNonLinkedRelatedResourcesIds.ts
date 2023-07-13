import { useMemo } from 'react';

import { IdEither } from '@cognite/sdk';

import { ResourceType } from '@data-exploration-lib/core';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { useAssetIdsQuery } from '../../service';
import { BaseResourceProps } from '../types';
import {
  convertToSdkResourceType,
  extractExternalId,
  getResourceId,
} from '../utils';

export const useNonLinkedRelatedResourcesIds = ({
  resource,
  resourceType,
  isDocumentsApiEnabled = true,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled?: boolean;
}) => {
  const relatedResourceExternalIds = useRelatedResourceExternalIds({
    resourceExternalId: extractExternalId(resource),
  });

  const assetIds = useAssetIdsQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceId: getResourceId(resource),
    isDocumentsApiEnabled,
  });

  const data: IdEither[] = useMemo(() => {
    return [
      ...relatedResourceExternalIds.data[resourceType].map((externalId) => ({
        externalId,
      })),
      ...(assetIds.data || []).map((id) => ({ id })),
    ];
  }, [assetIds.data, relatedResourceExternalIds.data, resourceType]);

  const isLoading = relatedResourceExternalIds.isLoading || assetIds.isLoading;

  return { data, isLoading };
};
