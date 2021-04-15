import axios from 'axios';

export type Header = {
  Authorization: string;
};

export type GetHmac = {
  hmac: string;
  userUid: string;
};

export default (appsApiUrl: string, headers: Header): Promise<GetHmac> => {
  return axios
    .get(`${appsApiUrl}/intercom`, {
      params: {},
      headers,
    })
    .then(({ data: { hmac, userUid } }) => ({ hmac, userUid }));
};
