import axios from 'axios';

import { AuthHeaders, GetHmacSettings } from '../types';

export default (
  appsApiUrl: string,
  headers: AuthHeaders
): Promise<GetHmacSettings> =>
  axios
    .get(`${appsApiUrl}/intercom`, {
      params: {},
      headers,
    })
    .then(({ data: { hmac, userUid } }) => ({ hmac, userUid }));
