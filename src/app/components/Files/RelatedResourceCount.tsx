import React, { useMemo } from 'react';
import { ResourceType } from 'lib';

import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { useAnnotations } from 'app/hooks';

type Props = {
  fileId: number;
  resourceType?: ResourceType;
};
export default function RelatedResourceCount({ fileId, resourceType }: Props) {
  const { data: annotations } = useAnnotations(fileId, resourceType);

  const ids = useMemo(
    () =>
      new Set(
        annotations
          .map(
            ({ metadata = {} }) =>
              metadata[`${PREFIX}resource_external_id`] ||
              metadata[`${PREFIX}resource_id`]
          )
          .filter(Boolean)
      ),
    [annotations]
  );

  if (ids.size > 0) {
    return <>({ids.size})</>;
  }
  return null;
}
