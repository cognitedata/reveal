import { adaptSaveSearchContentToSchemaBody } from 'domain/savedSearches/internal/adapters/adaptSaveSearchContentToSchemaBody';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useMutation, useQueryClient } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';
import { handleServiceError } from 'utils/errors';

import { getTenantInfo } from '@cognite/react-container';

import { RELATED_DOCUMENT_KEY, WELL_QUERY_KEY } from 'constants/react-query';

export const useRelatedDocumentPatchMutate = () => {
  const queryClient = useQueryClient();

  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useMutation(
    async (savedSearchContent: SavedSearchContent) => {
      await discoverAPI.savedSearches
        .create(
          RELATED_DOCUMENT_KEY,
          adaptSaveSearchContentToSchemaBody(savedSearchContent),
          headers,
          tenant
        )
        .catch(handleServiceError);

      // if the saved search returns an error, we still need the filters to work properly
      // hence returning a new promise with the filters
      return new Promise<SavedSearchContent>((resolve) => {
        resolve(savedSearchContent);
      });
    },
    {
      onSuccess: (data: SavedSearchContent) => {
        queryClient.setQueryData(RELATED_DOCUMENT_KEY, data);
        queryClient.invalidateQueries(WELL_QUERY_KEY.RELATED_DOCUMENTS);
      },
    }
  );
};
