import React, { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { Loader } from 'components';
import { SelectableItemsProps, ResourceType, convertResourceType } from 'types';
import { Alert } from 'antd';
import {
  AssetTable,
  TimeseriesTable,
  SequenceTable,
  EventTable,
  FileTable,
} from 'containers';

import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { IdEither } from '@cognite/sdk';
import { useAnnotations } from 'hooks/RelationshipHooks';
import { useUniqueCdfItems } from 'hooks';

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
    data: annotations,
    isFetched,
    isError,
  } = useAnnotations(fileId, resourceType);

  const ids = useMemo(
    () =>
      uniqBy(
        annotations.map(({ metadata = {} }) => {
          if (metadata[`${PREFIX}resource_external_id`]) {
            return {
              externalId: metadata[`${PREFIX}resource_external_id`],
            };
          }
          if (metadata[`${PREFIX}resource_id`]) {
            return { id: parseInt(metadata[`${PREFIX}resource_id`], 10) };
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
    [annotations]
  );

  function onRowClick<T extends { id: number }>({ id }: T) {
    onItemClicked(id);
  }

  const itemsEnabled = ids && ids.length > 0;
  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
  } = useUniqueCdfItems(convertResourceType(resourceType), ids, true);

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
