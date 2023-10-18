import { ResourceType } from '@data-exploration-lib/core';

import {
  useAnnotatedFileIdsOfAsset,
  useFileAnnotationsResourceIds,
} from '../../../annotations';
import { BaseResourceProps } from '../types';
import { getResourceId } from '../utils';

export const useAnnotationsCount = ({
  resource,
  resourceType,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
}) => {
  const resourceId = getResourceId(resource);

  const annotatedFileIdsOfAsset = useAnnotatedFileIdsOfAsset({
    assetId: resource.id,
    enabled: resource.type === 'asset' && resourceType === 'file',
  });

  const fileAnnotationsResourceIds = useFileAnnotationsResourceIds(
    resourceId,
    resource.type === 'file'
  );

  if (resource.type === 'asset' && resourceType === 'file') {
    return {
      data: annotatedFileIdsOfAsset.data.length,
      isLoading: annotatedFileIdsOfAsset.isInitialLoading,
    };
  }

  if (resource.type === 'file') {
    return {
      data: fileAnnotationsResourceIds.data[resourceType].length,
      isLoading: fileAnnotationsResourceIds.isInitialLoading,
    };
  }

  return {
    data: 0,
    isLoading: false,
  };
};
