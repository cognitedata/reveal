import axios from 'axios';

import { GetHmacHeader, GetHmacSettings } from '../types';

export default (
  appsApiUrl: string,
  headers: GetHmacHeader
): Promise<GetHmacSettings> => {
  return axios
    .get(`${appsApiUrl}/intercom`, {
      params: {},
      headers,
    })
    .then(({ data: { hmac, userUid } }) => ({ hmac, userUid }));
};
