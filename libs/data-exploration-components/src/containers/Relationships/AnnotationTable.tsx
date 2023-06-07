import React, { useMemo } from 'react';

import { Loader } from '@data-exploration/components';
import {
  AssetTable,
  EventTable,
  SequenceTable,
  TimeseriesTable,
} from '@data-exploration/containers';
import { FileTable } from '@data-exploration-components/containers';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import { useTaggedAnnotationsByResourceType } from '@data-exploration-components/hooks/RelationshipHooks';
import {
  SelectableItemsProps,
  ResourceType,
  convertResourceType,
} from '@data-exploration-components/types';
import { Alert } from 'antd';
import uniqBy from 'lodash/uniqBy';

import { IdEither } from '@cognite/sdk';

import {
  getResourceExternalIdFromTaggedAnnotation,
  getResourceIdFromTaggedAnnotation,
} from '../Files';

type Props = {
  fileId: number;
  resourceType: ResourceType;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
};
export function AnnotationTable({
  fileId,
  resourceType,
  onItemClicked,
  onParentAssetClick,
}: Props & SelectableItemsProps) {
  const {
    data: taggedAnnotations,
    isInitialLoading: isTaggedAnnotationsInitialLoading,
    isError,
  } = useTaggedAnnotationsByResourceType(fileId, resourceType);

  const ids = useMemo(
    () =>
      uniqBy(
        taggedAnnotations.map((taggedAnnotation) => {
          const resourceExternalId =
            getResourceExternalIdFromTaggedAnnotation(taggedAnnotation);
          if (resourceExternalId) {
            return {
              externalId: resourceExternalId,
            };
          }

          const resourceId =
            getResourceIdFromTaggedAnnotation(taggedAnnotation);
          if (resourceId) {
            return { id: resourceId };
          }

          return undefined;
        }),
        (
          i:
            | { id: number; externalId: undefined }
            | { id: undefined; externalId: string }
            | undefined
        ) => i?.externalId || i?.id
      ).filter(Boolean) as IdEither[],
    [taggedAnnotations]
  );

  function onRowClick<T extends { id: number }>({ id }: T) {
    onItemClicked(id);
  }

  const itemsEnabled = ids && ids.length > 0;
  const {
    data: items = [],
    isInitialLoading: isUniqueCdfItemsInitialLoading,
    isError: itemsError,
  } = useUniqueCdfItems<any>(convertResourceType(resourceType), ids, true);

  if (isError || itemsError) {
    return <Alert type="warning" message="Error fetching annotations" />;
  }

  if (
    isTaggedAnnotationsInitialLoading &&
    isUniqueCdfItemsInitialLoading &&
    itemsEnabled
  ) {
    return <Loader />;
  }

  switch (resourceType) {
    case 'asset': {
      return (
        <AssetTable
          data={items}
          hideColumnToggle
          onRowClick={onRowClick}
          id="asset-annotations-table"
        />
      );
    }
    case 'file': {
      return (
        <FileTable
          id="file-annotation-table"
          data={items}
          onRowClick={onRowClick}
          onDirectAssetClick={(directAsset) => {
            onParentAssetClick(directAsset.id);
          }}
        />
      );
    }
    case 'timeSeries': {
      return (
        <TimeseriesTable
          hideColumnToggle
          id="timeseries-annotation-table"
          data={items}
          onRowClick={onRowClick}
        />
      );
    }
    case 'event': {
      return (
        <EventTable
          id="event-annotatio-table"
          data={items}
          onRowClick={onRowClick}
        />
      );
    }
    case 'sequence': {
      return (
        <SequenceTable
          id="sequence-annotation-table"
          data={items}
          hideColumnToggle
          onRowClick={onRowClick}
        />
      );
    }
    default:
      return null;
  }
}
