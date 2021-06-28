import axios from 'axios';

import { AuthHeaders, GetHmacSettings } from '../types';

export default (
  appsApiUrl: string,
  headers: AuthHeaders,
  project?: string
): Promise<GetHmacSettings> =>
  axios
    .get(`${appsApiUrl}${project ? `/${project}` : ''}/intercom`, {
      params: {},
      headers,
    })
    .then(({ data: { hmac, userUid } }) => ({ hmac, userUid }));
