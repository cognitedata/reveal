import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { ResourceType } from '@data-exploration-lib/core';

import {
  useAnnotatedFileIdsOfAsset,
  useFileAnnotationsResourceIds,
} from '../../../annotations';
import { useValidResourcesCountQuery } from '../../service';
import { BaseResourceProps } from '../types';
import { convertToSdkResourceType, getResourceId } from '../utils';

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

  const { data, isDataLoading } = useMemo(() => {
    if (resource.type === 'asset' && resourceType === 'file') {
      return {
        data: annotatedFileIdsOfAsset.data,
        isDataLoading: annotatedFileIdsOfAsset.isInitialLoading,
      };
    }

    if (resource.type === 'file') {
      return {
        data: fileAnnotationsResourceIds.data[resourceType],
        isDataLoading: fileAnnotationsResourceIds.isInitialLoading,
      };
    }

    return {
      data: [],
      isDataLoading: false,
    };
  }, [
    annotatedFileIdsOfAsset.data,
    annotatedFileIdsOfAsset.isInitialLoading,
    fileAnnotationsResourceIds.data,
    fileAnnotationsResourceIds.isInitialLoading,
    resource.type,
    resourceType,
  ]);

  const annotationsResourceIds = useMemo(() => {
    return data.map((id) => ({ id }));
  }, [data]);

  const validCount = useValidResourcesCountQuery({
    resourceType: convertToSdkResourceType(resourceType),
    resourceIds: annotationsResourceIds,
    isDocumentsApiEnabled,
  });

  const linkedResources = useLinkedResourcesCount({
    resource,
    resourceType,
    isDocumentsApiEnabled,
    linkedResourceIds: annotationsResourceIds,
    enabled: !isEmpty(annotationsResourceIds) && ignoreLinkedResources,
  });

  const count = validCount.data || 0;
  const isLoading = isDataLoading || validCount.isInitialLoading;

  if (!isEmpty(annotationsResourceIds) && ignoreLinkedResources) {
    return {
      data: count - linkedResources.data,
      isLoading: isLoading || linkedResources.isLoading,
    };
  }

  return {
    data: count,
    isLoading,
  };
};
