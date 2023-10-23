import React, { useMemo } from 'react';

import { EmptyState } from '@data-exploration/components';
import {
  AssetLinkedSearchResults,
  EventLinkedSearchResults,
  FileLinkedSearchResults,
  SequenceLinkedSearchResults,
  TimeseriesLinkedSearchResults,
} from '@data-exploration/containers';
import isEmpty from 'lodash/isEmpty';

import {
  convertResourceType,
  useTranslation,
} from '@data-exploration-lib/core';
import { useAssetIdsQuery } from '@data-exploration-lib/domain-layer';

import { ResourceItem, ResourceType } from '../../types';

export const DirectlyLinkedResourceTable = ({
  isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  onParentAssetClick,
  isDocumentsApiEnabled = true,
}: {
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
  isDocumentsApiEnabled?: boolean;
}) => {
  const { t } = useTranslation();

  const { data: assetIds = [], isInitialLoading } = useAssetIdsQuery({
    resourceType: convertResourceType(parentResource.type),
    resourceId: { id: parentResource.id },
    isDocumentsApiEnabled,
    enabled: parentResource.type === 'asset' || type === 'asset',
  });

  const filter = useMemo(() => {
    return assetIds.map((assetId) => {
      return { value: assetId };
    });
  }, [assetIds]);

  if (isEmpty(assetIds)) {
    return <EmptyState isLoading={isInitialLoading} />;
  }

  switch (type) {
    case 'asset':
      return (
        <AssetLinkedSearchResults
          defaultFilter={
            parentResource.type === 'asset'
              ? { parentIds: filter }
              : { assetIds: filter }
          }
          onClick={(row) => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          defaultFilter={{ assetIds: filter }}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'file':
      return (
        <FileLinkedSearchResults
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          defaultFilter={{ assetIds: filter }}
          isGroupingFilesEnabled={isGroupingFilesEnabled}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          defaultFilter={{ assetIds: filter }}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          defaultFilter={{ assetIds: filter }}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    default:
      return <>{t('NO_RELATIONSHIPS_FOUND', 'No relationships found')}</>;
  }
};
