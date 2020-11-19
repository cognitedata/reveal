import React, { useMemo } from 'react';
import uniqBy from 'lodash/uniqBy';
import { Loader } from 'lib/components';
import { Alert } from 'antd';
import {
  ResourceType,
  convertResourceType,
  AssetTable,
  FileTable,
  TimeseriesTable,
  EventTable,
  SequenceTable,
} from 'lib';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { createLink } from '@cognite/cdf-utilities';
import { useHistory } from 'react-router-dom';

import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';

import { useAnnotations } from 'app/hooks';
import { IdEither } from '@cognite/sdk';

type Props = {
  fileId: number;
  resourceType: ResourceType;
};
export default function RelatedResources({ fileId, resourceType }: Props) {
  const history = useHistory();
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
    return <Alert type="warning" message="nope" />;
  }

  if (!isFetched || (!itemsFetched && itemsEnabled)) {
    return <Loader />;
  }

  switch (resourceType) {
    case 'asset': {
      return (
        <AssetTable
          data={items}
          onRowClick={({ id }) =>
            history.push(createLink(`/explore/asset/${id}`))
          }
        />
      );
    }
    case 'file': {
      return (
        <FileTable
          data={items}
          onRowClick={({ id }) =>
            history.push(createLink(`/explore/file/${id}`))
          }
        />
      );
    }
    case 'timeSeries': {
      return (
        <TimeseriesTable
          data={items}
          onRowClick={({ id }) =>
            history.push(createLink(`/explore/timeseries/${id}`))
          }
        />
      );
    }
    case 'event': {
      return (
        <EventTable
          data={items}
          onRowClick={({ id }) =>
            history.push(createLink(`/explore/event/${id}`))
          }
        />
      );
    }
    case 'sequence': {
      return (
        <SequenceTable
          data={items}
          onRowClick={({ id }) =>
            history.push(createLink(`/explore/sequence/${id}`))
          }
        />
      );
    }
    default:
      return null;
  }
}
