import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { ResourceType } from '@data-exploration-lib/core';

import {
  useAnnotatedFileIdsOfAsset,
  useFileAnnotationsResourceIds,
} from '../../../annotations';
import { BaseResourceProps } from '../types';
import { getResourceId } from '../utils';

import { useLinkedResourcesCount } from './useLinkedResourcesCount';

export const useAnnotationsCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled,
  ignoreLinkedResources = false,
}: {
  resource: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled: boolean;
  ignoreLinkedResources?: boolean;
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

  const { data, isLoading } = useMemo(() => {
    if (resource.type === 'asset' && resourceType === 'file') {
      return {
        data: annotatedFileIdsOfAsset.data,
        isLoading: annotatedFileIdsOfAsset.isInitialLoading,
      };
    }

    if (resource.type === 'file') {
      return {
        data: fileAnnotationsResourceIds.data[resourceType],
        isLoading: fileAnnotationsResourceIds.isInitialLoading,
      };
    }

    return {
      data: [],
      isLoading: false,
    };
  }, [
    annotatedFileIdsOfAsset.data,
    annotatedFileIdsOfAsset.isInitialLoading,
    fileAnnotationsResourceIds.data,
    fileAnnotationsResourceIds.isInitialLoading,
    resource.type,
    resourceType,
  ]);

  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
    linkedResourceIds: data.map((id) => ({ id })),
    enabled: !isEmpty(data) && ignoreLinkedResources,
  });

  if (!isEmpty(data) && ignoreLinkedResources) {
    return {
      data: data.length - linkedResources.data,
      isLoading: isLoading || linkedResources.isLoading,
    };
  }

  return {
    data: data.length,
    isLoading,
  };
};
