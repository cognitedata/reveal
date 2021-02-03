import React, { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { Loader } from 'components';
import { SelectableItemsProps } from 'CommonProps';
import { ResourceType, convertResourceType } from 'types';
import { Alert } from 'antd';
import {
  AssetTable,
  FileTable,
  TimeseriesTable,
  EventTable,
  SequenceTable,
} from 'containers';

import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { IdEither } from '@cognite/sdk';
import { useAnnotations } from 'hooks/RelationshipHooks';

type Props = {
  fileId: number;
  resourceType: ResourceType;
  onItemClicked: (id: number) => void;
};
export default function AnnotationTable({
  fileId,
  resourceType,
  onItemClicked,
  ...props
}: Props & SelectableItemsProps) {
  const { data: annotations, isFetched, isError } = useAnnotations(
    fileId,
    resourceType
  );

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

  const itemsEnabled = ids && ids.length > 0;
  const {
    data: items = [],
    isFetched: itemsFetched,
    isError: itemsError,
  } = useCdfItems(convertResourceType(resourceType), ids, {
    enabled: itemsEnabled,
  });

  if (isError || itemsError) {
    return <Alert type="warning" message="Error fetching annotations" />;
  }

  if (!isFetched || (!itemsFetched && itemsEnabled)) {
    return <Loader />;
  }

  switch (resourceType) {
    case 'asset': {
      return (
        <AssetTable
          data={items}
          onRowClick={el => onItemClicked(el.id)}
          {...props}
        />
      );
    }
    case 'file': {
      return (
        <FileTable
          data={items}
          onRowClick={el => onItemClicked(el.id)}
          {...props}
        />
      );
    }
    case 'timeSeries': {
      return (
        <TimeseriesTable
          data={items}
          onRowClick={el => onItemClicked(el.id)}
          {...props}
        />
      );
    }
    case 'event': {
      return (
        <EventTable
          data={items}
          onRowClick={el => onItemClicked(el.id)}
          {...props}
        />
      );
    }
    case 'sequence': {
      return (
        <SequenceTable
          data={items}
          onRowClick={el => onItemClicked(el.id)}
          {...props}
        />
      );
    }
    default:
      return null;
  }
}
