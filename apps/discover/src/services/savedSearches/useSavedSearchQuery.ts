import { useQuery, useMutation, useQueryClient } from 'react-query';

import {
  SavedSearchItem,
  SavedSearchContent,
} from 'services/savedSearches/types';
import { updateCurrentSearch } from 'services/savedSearches/utils';
import { discoverAPI, useJsonHeaders } from 'services/service';
import { log } from 'utils/log';

import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import {
  RELATED_DOCUMENT_KEY,
  SAVED_SEARCHES_QUERY_KEY,
  SAVED_SEARCHES_QUERY_KEY_CURRENT,
  SURVEYS_QUERY_KEY,
} from 'constants/react-query';
import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useSearchActions } from 'hooks/useSearchActions';
import { Modules } from 'modules/sidebar/types';

import { GenericApiError } from '../types';

import { SAVED_SEARCHES_CURRENT_KEY } from './constants';

// Need to keep separate query for related document filters
// This does not tie into 'current' filters
export const useQuerySavedSearchRelatedDocuments = () => {
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery(
    RELATED_DOCUMENT_KEY,
    () => discoverAPI.savedSearches.get(RELATED_DOCUMENT_KEY, headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};

export const useQuerySavedSearchCurrent = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(
    SAVED_SEARCHES_QUERY_KEY_CURRENT,
    () =>
      discoverAPI.savedSearches.get(
        SAVED_SEARCHES_CURRENT_KEY,
        headers,
        tenant
      ),
    {
      enabled: true,
      retry: false,
    }
  );
};

export const useQuerySavedSearchesList = () => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery<SavedSearchItem[]>(
    SAVED_SEARCHES_QUERY_KEY,
    () => discoverAPI.savedSearches.list(headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};

export const useQuerySavedSearcheGetOne = (id: string) => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery<SavedSearchContent>(
    [SAVED_SEARCHES_QUERY_KEY, id],
    () =>
      discoverAPI.savedSearches
        .get(id, headers, tenant)
        .then((response) => response as SavedSearchContent),
    {
      enabled: true,
      retry: false,
    }
  );
};

export const useMutatePatchSavedSearch = (
  doSearch = true,
  successCallback?: (data: SavedSearchContent | GenericApiError) => void
) => {
  const currentSavedSearch = useCurrentSavedSearchState();
  const headers = useJsonHeaders({}, true);
  const { data: seismicConfig } = useProjectConfigByKey(Modules.SEISMIC);
  const { doCommonSearch } = useSearchActions();
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (savedSearchPatchContent: Partial<SavedSearchContent>) => {
      // console.log('Should update saved search with:', savedSearchPatchContent);
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
          doCommonSearch(data, queryClient, headers);
        }

        if (seismicConfig && !seismicConfig?.disabled)
          queryClient.invalidateQueries(SURVEYS_QUERY_KEY);
        if (successCallback) successCallback(data);
      },
    }
  );
};
