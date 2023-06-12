import { DocumentsSearchRequest } from '@cognite/sdk-playground';
import merge from 'lodash/merge';
import { DocumentSearchQuery } from 'apps/cdf-document-search/src/services/types';

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

  if (query?.sources && query.sources.length > 0) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          sourceFile: {
            source: {
              in: query.sources,
            },
          },
        },
      }
    );
  }

  if (query?.fileTypes && query.fileTypes.length > 0) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          type: {
            in: query.fileTypes,
          },
        },
      }
    );
  }

  if (query?.labels && query.labels.length > 0) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          labels: {
            containsAny: query.labels.map((externalId) => ({
              externalId,
            })),
          },
        },
      }
    );
  }

  if (!query?.showDocumentsLabeledInFiles) {
    filterBuilder = merge<DocumentsSearchRequest, DocumentsSearchRequest>(
      filterBuilder,
      {
        filter: {
          sourceFile: {
            labels: {
              missing: true,
            },
          },
        },
      }
    );
  }

  return filterBuilder;
};
