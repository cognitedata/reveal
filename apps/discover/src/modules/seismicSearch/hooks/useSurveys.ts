import { useQuery, QueryClient } from 'react-query';

import { SeismicError } from 'services/seismic';
import { discoverAPI, useJsonHeaders } from 'services/service';
import { SeismicGetData } from 'services/types';
import { FetchHeaders } from 'utils/fetch';

import { getTenantInfo } from '@cognite/react-container';

import { SURVEYS_QUERY_KEY } from 'constants/react-query';

import { SeismicSurveyContainer } from '../types';

export const getSurveyKey = (surveyId: string) => ['survey', surveyId];

export const updateOneSurveyInList = (
  queryClient: QueryClient,
  surveyData: SeismicGetData,
  allSurveyData: SeismicSurveyContainer[]
) => {
  const newData = allSurveyData.map((survey) => {
    return {
      ...survey,
      geometry: surveyData.survey.geometry,
    };
  });

  queryClient.setQueryData(SURVEYS_QUERY_KEY, newData);
};

export const useSurveys = () => {
  const [tenant] = getTenantInfo();
  const headers = useJsonHeaders();

  return useQuery<SeismicSurveyContainer[], SeismicError>(
    SURVEYS_QUERY_KEY,
    () => discoverAPI.seismic.search(headers, tenant),
    {
      // retry: false,
      enabled: true,

      // cacheTime: 1, // always retry because it is based on 'current'
      // staleTime: 1,

      // new trial, NEVER cache, wait till we remove the current cache:
      cacheTime: Infinity, // always retry because it is based on 'current'
      staleTime: Infinity,
    }
  );
};

export const prefetchSurveys = (
  headers: FetchHeaders,
  queryClient: QueryClient
) => {
  const [tenant] = getTenantInfo();

  // console.log('prefetchSurveys');
  return queryClient.prefetchQuery(SURVEYS_QUERY_KEY, () =>
    discoverAPI.seismic.search(headers, tenant)
  );
  // return seismic
  //   .search()
  //   .then((result) => queryCache.setQueryData(SURVEYS, result));
};

// expand on one in the results list, showing all the files for it etc.
export const useSurvey = (surveyId: string) => {
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery<SeismicGetData | SeismicError>(
    getSurveyKey(surveyId),
    () =>
      surveyId
        ? discoverAPI.seismic.get(surveyId, headers, tenant)
        : Promise.reject(new Error('Survey Id not supplied.')),
    {
      retry: false,
      enabled: !!surveyId,
    }
  );
};
