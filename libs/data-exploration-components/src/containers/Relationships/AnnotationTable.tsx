import {
  AssetTable,
  EventTable,
  SequenceTable,
  TimeseriesTable,
} from '@data-exploration/containers';
import React, { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { Loader } from '@data-exploration/components';
import {
  SelectableItemsProps,
  ResourceType,
  convertResourceType,
} from '@data-exploration-components/types';
import { Alert } from 'antd';
import { FileTable } from '@data-exploration-components/containers';

import { IdEither } from '@cognite/sdk';
import { useTaggedAnnotationsByResourceType } from '@data-exploration-components/hooks/RelationshipHooks';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import {
  getResourceExternalIdFromTaggedAnnotation,
  getResourceIdFromTaggedAnnotation,
} from '../Files';

type Props = {
  fileId: number;
  resourceType: ResourceType;
  onItemClicked: (id: number) => void;
};
export function AnnotationTable({
  fileId,
  resourceType,
  onItemClicked,
}: Props & SelectableItemsProps) {
  const {
    data: taggedAnnotations,
    isFetched,
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
    isLoading: itemsLoading,
    isError: itemsError,
  } = useUniqueCdfItems<any>(convertResourceType(resourceType), ids, true);

  if (isError || itemsError) {
    return <Alert type="warning" message="Error fetching annotations" />;
  }

  if (!isFetched || (itemsLoading && itemsEnabled)) {
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
