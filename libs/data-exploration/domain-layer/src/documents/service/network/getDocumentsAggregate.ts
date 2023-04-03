import { AggregateResponse, CogniteClient, CursorResponse } from '@cognite/sdk';
import { DocumentsAggregateRequestPayload } from '../types';

export const getDocumentsAggregate = <ResponseType = AggregateResponse>(
  sdk: CogniteClient,
  payload?: DocumentsAggregateRequestPayload
) => {
  return sdk
    .post<CursorResponse<ResponseType[]>>(
      `/api/v1/projects/${sdk.project}/documents/aggregate`,
      {
        headers: {
          'cdf-version': '20230101-alpha',
          'cdf-experiments': 'document-search-in-data-explorer',
        },
        data: {
          ...payload,
          limit: 1000,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
