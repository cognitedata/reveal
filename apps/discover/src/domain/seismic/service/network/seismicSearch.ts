import { fetchGet, FetchHeaders } from 'utils/fetch';
import { log } from 'utils/log';

import { SIDECAR } from 'constants/app';
import { GenericApiError } from 'core/types';
import { SeismicSurveyContainer } from 'modules/seismicSearch/types';
import { normalizeSurvey } from 'modules/seismicSearch/utils';

import { SeismicSearchResult } from './types';

export type SeismicError = GenericApiError;

export const seismicError: SeismicError = {
  error: true,
};
export const seismicSearch = async (headers: FetchHeaders, tenant: string) => {
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
};
