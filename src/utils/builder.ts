import { ExternalDocumentsSearch } from '@cognite/sdk-playground';
import merge from 'lodash/merge';
import { DocumentSearchQuery } from 'services/types';

export const documentBuilder = (
  query?: DocumentSearchQuery
): ExternalDocumentsSearch => {
  let filterBuilder = {} as ExternalDocumentsSearch;

  if (query?.searchQuery) {
    filterBuilder = merge<ExternalDocumentsSearch, ExternalDocumentsSearch>(
      filterBuilder,
      {
        search: {
          query: query.searchQuery,
        },
      }
    );
  }

  if (query?.source) {
    filterBuilder = merge<ExternalDocumentsSearch, ExternalDocumentsSearch>(
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
    filterBuilder = merge<ExternalDocumentsSearch, ExternalDocumentsSearch>(
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
    filterBuilder = merge<ExternalDocumentsSearch, ExternalDocumentsSearch>(
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
