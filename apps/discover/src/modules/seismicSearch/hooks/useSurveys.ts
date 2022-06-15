import {
  SeismicError,
  seismicGet,
} from 'domain/seismic/service/network/seismicGet';
import { seismicSearch } from 'domain/seismic/service/network/seismicSearch';
import { SeismicGetData } from 'domain/seismic/service/network/types';

import { useQuery, QueryClient } from 'react-query';

import { FetchHeaders } from 'utils/fetch';

import { getProjectInfo } from '@cognite/react-container';

import { SURVEYS_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

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
  const [tenant] = getProjectInfo();
  const headers = useJsonHeaders();

  return useQuery<SeismicSurveyContainer[], SeismicError>(
    SURVEYS_QUERY_KEY,
    () => seismicSearch(headers, tenant),
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
  const [tenant] = getProjectInfo();

  // console.log('prefetchSurveys');
  return queryClient.prefetchQuery(SURVEYS_QUERY_KEY, () =>
    seismicSearch(headers, tenant)
  );
  // return seismic
  //   .search()
  //   .then((result) => queryCache.setQueryData(SURVEYS, result));
};

// expand on one in the results list, showing all the files for it etc.
export const useSurvey = (surveyId: string) => {
  const headers = useJsonHeaders();
  const [tenant] = getProjectInfo();

  return useQuery<SeismicGetData | SeismicError>(
    getSurveyKey(surveyId),
    () =>
      surveyId
        ? seismicGet(surveyId, headers, tenant)
        : Promise.reject(new Error('Survey Id not supplied.')),
    {
      retry: false,
      enabled: !!surveyId,
    }
  );
};
