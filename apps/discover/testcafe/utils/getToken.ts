import fetch, { Request, Response, Headers } from 'cross-fetch';

import App from '../__pages__/App';

import { getTestUserId } from './getUserId';
import { progress } from './utils';

const TOKEN_PREFIX = 'discover-e2e';

const rawHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
const headers = new Headers(rawHeaders);

const customFetch = async (
  input: RequestInfo,
  init: RequestInit
): Promise<any> => {
  const req = new Request(input);

  return fetch(req, init)
    .then((response: Response): Promise<any> => {
      // console.log('Resonse:', response);
      if (!response) {
        throw new Error('Make sure the docker FakeIDP is running');
      }

      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    })
    .then((response: any): Promise<Response> => {
      // Clone user just for the sake of using `new Response`
      const json = JSON.stringify(response);
      const res = new Response(json, { headers });

      return res.json();
    })
    .catch((err: Error): void => {
      console.error('Custom fetch error:', err);
    });
};

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

export const getFullUserId = () => {
  const userId = getTestUserId();

  return `${TOKEN_PREFIX}-user-${userId}`;
};

// make sure we get the same token as the one we use locally
export const getTokenHeaders = ({
  access, // get access token
}: {
  access?: boolean;
} = {}): Promise<Record<string, string>> => {
  const userId = getTestUserId();

  progress('');
  progress('Info:');
  progress(` - User id: ${userId}`);
  // progress(` - Cluster: ${App.cluster}`);
  // progress(` - Project: ${App.project}`);
  progress('');

  return customFetch('http://127.0.0.1:8200/login/token', {
    method: 'POST',
    body: JSON.stringify({
      cluster: App.cluster,
      fakeApplicationId:
        App.cluster === 'bluefield'
          ? '1f860e84-7353-4533-a088-8fbe3228400f' // bluefield
          : '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48', // azure-dev
      groups: ['defaultGroup', 'writeGroup'],
      roles: [],
      project: App.project,
      tokenId: TOKEN_PREFIX,
      userId,
    }),
    headers,
  }).then((response: any): Record<string, string> => {
    if (!response) {
      progress('--!!!!--');
      progress('Invalid response from Fake IdP');
      progress('--!!!!--');
      return {};
    }

    // useful for debugging invalid tokens!
    // console.log('Token response:', response);

    if (access) {
      return { token: response.access_token };
    }

    return {
      ...rawHeaders,
      Authorization: `Bearer ${response.id_token}`,
    };
  });
};
