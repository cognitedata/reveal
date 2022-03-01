import { DocumentsSearchRequest } from '@cognite/sdk-playground';
import merge from 'lodash/merge';
import { DocumentSearchQuery } from 'services/types';

export const documentBuilder = (
  query?: DocumentSearchQuery
): DocumentsSearchRequest => {
  let filterBuilder = {} as DocumentsSearchRequest;

  if (query?.searchQuery) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        search: {
          query: query.searchQuery,
        },
      }
    );
  }

  if (query?.source) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          sourceFile: {
            source: {
              in: [query.source],
            },
          },
        },
      }
    );
  }

  if (query?.fileType) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          type: {
            in: [query.fileType],
          },
        },
      }
    );
  }

  if (query?.documentType) {
    // 'labels' is incorrectly typed in the SDK.. Removing type check.
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          labels: {
            containsAny: [{ externalId: query.documentType }],
          },
        },
      }
    );
  }

  return filterBuilder;
};
