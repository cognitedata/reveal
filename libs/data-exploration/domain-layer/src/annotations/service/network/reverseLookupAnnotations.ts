import {
  AnnotationsAssetRef,
  CogniteClient,
  CursorResponse,
} from '@cognite/sdk';

import { AnnotationReverseLookupFilterProps } from '../types';

export const reverseLookupAnnotations = async (
  sdk: CogniteClient,
  {
    filter,
    cursor,
    limit,
  }: {
    filter: AnnotationReverseLookupFilterProps;
    cursor?: string;
    limit?: number;
  }
) => {
  return sdk
    .post<CursorResponse<AnnotationsAssetRef[]>>(
      `/api/v1/projects/${sdk.project}/annotations/reverselookup`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter,
          limit: limit ?? 1000,
          cursor,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
        nextCursor: data.nextCursor,
      };
    });
};
