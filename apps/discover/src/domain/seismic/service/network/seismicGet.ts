import { fetchGet, FetchHeaders } from 'utils/fetch';

import { SIDECAR } from 'constants/app';
import { GenericApiError } from 'core/types';

import { SeismicGetResult } from './types';

export type SeismicError = GenericApiError;

const seismicError: SeismicError = {
  error: true,
};
export const seismicGet = async (
  id: string,
  headers: FetchHeaders,
  tenant: string
) => {
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
};
