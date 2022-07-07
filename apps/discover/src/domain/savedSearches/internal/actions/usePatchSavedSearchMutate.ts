import { updateCurrentSearch } from 'domain/savedSearches/service/utils';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useMutation, useQueryClient } from 'react-query';

import { log } from 'utils/log';

import { getProjectInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import {
  SAVED_SEARCHES_QUERY_KEY_CURRENT,
  SURVEYS_QUERY_KEY,
} from 'constants/react-query';
import { GenericApiError } from 'core/types';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useSearchActions } from 'hooks/useSearchActions';
import { useCurrentSavedSearchState } from 'modules/sidebar/selectors/useCurrentSavedSearchState';
import { Modules } from 'modules/sidebar/types';

export const usePatchSavedSearchMutate = (
  doSearch = true,
  successCallback?: (data: SavedSearchContent | GenericApiError) => void
) => {
  const currentSavedSearch = useCurrentSavedSearchState();
  const headers = useJsonHeaders({}, true);
  const { data: seismicConfig } = useProjectConfigByKey(Modules.SEISMIC);
  const { doCommonSearch } = useSearchActions();
  const [tenant] = getProjectInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (savedSearchPatchContent: Partial<SavedSearchContent>) => {
      return updateCurrentSearch(
        currentSavedSearch,
        savedSearchPatchContent,
        false,
        headers,
        tenant
      );
    },
    {
      onSuccess: (data) => {
        if ('error' in data) {
          log('Error from useMutatePatchSavedSearch', [data]);
          reportException('Error updating saved search');
          return;
        }

        // need to set here, because the data in the db-service is only 'eventually consistent'
        queryClient.setQueryData(SAVED_SEARCHES_QUERY_KEY_CURRENT, data);
        // queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY_CURRENT);
        queryClient.invalidateQueries(SURVEYS_QUERY_KEY);

        if (doSearch) {
          // this is what activates the 'saved search'
          doCommonSearch(data, headers);
        }

        if (seismicConfig && !seismicConfig?.disabled)
          queryClient.invalidateQueries(SURVEYS_QUERY_KEY);
        if (successCallback) successCallback(data);
      },
    }
  );
};
