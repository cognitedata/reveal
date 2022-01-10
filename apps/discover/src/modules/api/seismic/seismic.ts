import { fetchGet, FetchHeaders } from 'utils/fetch';
import { log } from 'utils/log';

import { SIDECAR } from 'constants/app';
import { SeismicSurveyContainer } from 'modules/seismicSearch/types';
import { normalizeSurvey } from 'modules/seismicSearch/utils';

import {
  SeismicGetResult,
  SeismicSearchResult,
  GenericApiError,
} from '../types';

export type SeismicError = GenericApiError;

const seismicError: SeismicError = {
  error: true,
};
export const seismic = {
  get: async (id: string, headers: FetchHeaders, tenant: string) => {
    try {
      const response = await fetchGet<SeismicGetResult>(
        `${SIDECAR.discoverApiBaseUrl}/${tenant}/seismic/survey/${id}`,
        { headers }
      );

      if (response && response.error) {
        return seismicError;
      }

      if (response && response.success) {
        return response.data;
      }
    } catch (error) {
      console.error(error);
    }

    return seismicError;
  },

  search: async (headers: FetchHeaders, tenant: string) => {
    try {
      const response = await fetchGet<SeismicSearchResult>(
        `${SIDECAR.discoverApiBaseUrl}/${tenant}/v2/seismic/search/current`,
        { headers }
      );

      if ('error' in response) {
        // process error more?
        return [];
      }

      const result: SeismicSurveyContainer[] =
        response.data.results.map(normalizeSurvey);

      return result;
    } catch (error) {
      // console.log('error', error);
      log('Error during seismic search', (error as any).message);
      throw new Error('Bad seismic');
    }
  },
};
