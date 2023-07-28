import { useMemo } from 'react';

import { IdEither } from '@cognite/sdk';

import { useFileAnnotationsQuery } from '../../service';
import { transformToAnnotationsResourceIds } from '../transformers';

export const useFileAnnotationsResourceIds = (
  fileId?: IdEither,
  enabled = true
) => {
  const { data = [], ...rest } = useFileAnnotationsQuery(fileId, enabled);

  const annotationsByResourceType = useMemo(() => {
    return transformToAnnotationsResourceIds(data);
  }, [data]);

  return {
    data: annotationsByResourceType,
    ...rest,
  };
};
