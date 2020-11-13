import React from 'react';
import { Loader } from '@cognite/cogs.js';
import {
  ResourceType,
  convertResourceType,
  AssetTable,
  FileTable,
  TimeseriesTable,
  EventTable,
  SequenceTable,
} from 'lib';
import { useList, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent, IdEither } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import { useHistory } from 'react-router-dom';

import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { annotationFilter } from 'app/utils/filters';

type Props = {
  fileId: number;
  resourceType: ResourceType;
};
export default function RelatedResources({ fileId, resourceType }: Props) {
  const history = useHistory();
  const { data: annotations = [], isFetched: annotationsFetched } = useList<
    CogniteEvent
  >('events', {
    filter: annotationFilter(fileId, resourceType),
  });

  const ids = annotations
    .map(({ metadata = {} }) => {
      if (metadata[`${PREFIX}resource_external_id`]) {
        return {
          externalId: metadata[`${PREFIX}resource_external_id`],
        };
      }
      if (metadata[`${PREFIX}resource_id`]) {
        return { id: parseInt(metadata[`${PREFIX}resource_id`], 10) };
      }
      return undefined;
    })
    .filter(Boolean) as IdEither[];

  const itemsEnabled = ids && ids.length > 0;
  const { data: items = [], isFetched: itemsFetched } = useCdfItems(
    convertResourceType(resourceType),
    ids,
    {
      enabled: itemsEnabled,
    }
  );

  if (!annotationsFetched || (!itemsFetched && itemsEnabled)) {
    return <Loader />;
  }

  switch (resourceType) {
    case 'asset': {
      return (
        <AssetTable
          items={items}
          onItemClicked={(a: { id: number }) =>
            history.push(createLink(`/explore/asset/${a.id}`))
          }
        />
      );
    }
    case 'file': {
      return (
        <FileTable
          items={items}
          onItemClicked={(a: { id: number }) =>
            history.push(createLink(`/explore/file/${a.id}`))
          }
        />
      );
    }
    case 'timeSeries': {
      return (
        <TimeseriesTable
          items={items}
          onItemClicked={(a: { id: number }) =>
            history.push(createLink(`/explore/timeseries/${a.id}`))
          }
        />
      );
    }
    case 'event': {
      return (
        <EventTable
          items={items}
          onItemClicked={(a: { id: number }) =>
            history.push(createLink(`/explore/event/${a.id}`))
          }
        />
      );
    }
    case 'sequence': {
      return (
        <SequenceTable
          items={items}
          onItemClicked={(a: { id: number }) =>
            history.push(createLink(`/explore/sequence/${a.id}`))
          }
        />
      );
    }
    default:
      return null;
  }
}
