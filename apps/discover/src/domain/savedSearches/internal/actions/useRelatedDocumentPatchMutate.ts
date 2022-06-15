import { adaptSaveSearchContentToSchemaBody } from 'domain/savedSearches/internal/adapters/adaptSaveSearchContentToSchemaBody';
import { createSavedSearch } from 'domain/savedSearches/service/network/createSavedSearch';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useMutation, useQueryClient } from 'react-query';

import { handleServiceError } from 'utils/errors';

import { getProjectInfo } from '@cognite/react-container';

import { RELATED_DOCUMENT_KEY, WELL_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export const useRelatedDocumentPatchMutate = () => {
  const queryClient = useQueryClient();

  const headers = useJsonHeaders();
  const [tenant] = getProjectInfo();

  return useMutation(
    async (savedSearchContent: SavedSearchContent) => {
      await createSavedSearch(
        RELATED_DOCUMENT_KEY,
        adaptSaveSearchContentToSchemaBody(savedSearchContent),
        headers,
        tenant
      ).catch(handleServiceError);

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
