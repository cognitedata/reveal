import React from 'react';
import { ResourceType } from 'lib';
import { IdEither, CogniteEvent } from '@cognite/sdk/dist/src';
import { useList } from '@cognite/sdk-react-query-hooks';
import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { annotationFilter } from 'app/utils/filters';

type Props = {
  fileId: number;
  resourceType: ResourceType;
};
export default function RelatedResourceCount({ fileId, resourceType }: Props) {
  const { data: annotations = [] } = useList<CogniteEvent>('events', {
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

  if (ids.length > 0) {
    return <>({ids.length})</>;
  }
  return null;
}
