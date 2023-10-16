import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { ResourceTypes } from '@data-exploration-lib/core';

import { queryKeys } from '../../../queryKeys';
import {
  RelationshipsFilterInternal,
  addDetailViewData,
  useRelatedResourceDataForDetailView,
} from '../../../relationships';

/**
 * This is a temporary hook.
 * So, I didn't make too many files to separate the stuff.
 * Just wanted to get the work done with this hook.
 */
export const useRelatedFilesQuery = ({
  resourceExternalId,
  relationshipFilter,
  enabled = true,
}: {
  resourceExternalId?: string;
  relationshipFilter?: RelationshipsFilterInternal;
  enabled?: boolean;
}) => {
  const sdk = useSDK();

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: resourceExternalId,
      relationshipResourceType: ResourceTypes.File,
      filter: relationshipFilter,
    });

  const externalIds = useMemo(() => {
    return detailViewRelatedResourcesData.map(({ externalId }) => ({
      externalId,
    }));
  }, [detailViewRelatedResourcesData]);

  const hasRelatedFiles = !isEmpty(detailViewRelatedResourcesData);

  const { data, isLoading, ...rest } = useInfiniteQuery(
    queryKeys.relatedFiles(externalIds),
    () => {
      return sdk.files.retrieve(externalIds).catch(() => []);
    },
    {
      enabled: enabled && hasRelatedFiles,
      keepPreviousData: true,
    }
  );

  const transformedData = useMemo(() => {
    const files = data
      ? data?.pages.reduce((result, items) => {
          return [...result, ...items];
        }, [] as FileInfo[])
      : [];

    return addDetailViewData(files, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  return {
    data: transformedData,
    isLoading: enabled && hasRelatedFiles && isLoading,
    ...rest,
  };
};
