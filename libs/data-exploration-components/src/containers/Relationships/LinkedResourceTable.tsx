import React from 'react';

import {
  AssetLinkedSearchResults,
  EventLinkedSearchResults,
  FileLinkedSearchResults,
  SequenceLinkedSearchResults,
  TimeseriesLinkedSearchResults,
} from '@data-exploration/containers';

import { useTranslation } from '@data-exploration-lib/core';

import { ResourceItem, ResourceType, SelectableItemsProps } from '../../types';

export const LinkedResourceTable = ({
  isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  onParentAssetClick,
  isDocumentsApiEnabled = true,
}: // ...selectionMode
{
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
  isDocumentsApiEnabled?: boolean;
} & SelectableItemsProps) => {
  const { t } = useTranslation();

  const filter = { assetSubtreeIds: [{ value: parentResource.id }] };

  switch (type) {
    case 'asset':
      return (
        <AssetLinkedSearchResults
          defaultFilter={filter}
          onClick={(row) => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'file':
      return (
        <FileLinkedSearchResults
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          defaultFilter={filter}
          isGroupingFilesEnabled={isGroupingFilesEnabled}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    default:
      return <>{t('NO_RELATIONSHIPS_FOUND', 'No relationships found')}</>;
  }
};
