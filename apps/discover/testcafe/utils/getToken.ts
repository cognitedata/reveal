import { execSync } from 'child_process';
import os from 'os';

import fetch, { Request, Response, Headers } from 'cross-fetch';

import App from '../__pages__/App';

import { progress } from './utils';

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

// make sure we get the same token as the one we use locally
export const getTokenHeaders = (): Promise<Record<string, string>> => {
  let userId;
  try {
    // local
    userId = execSync('git config user.email').toString().trim();
  } catch {
    // CI
    userId = os.hostname().split('-').slice(-1).join('');
  }

  progress(' ');
  progress(`Using user id: ${userId}`);
  progress(' ');

  return customFetch('http://localhost:8200/login/token', {
    method: 'POST',
    body: JSON.stringify({
      cluster: App.cluster,
      fakeApplicationId:
        App.cluster === 'bluefield'
          ? '1f860e84-7353-4533-a088-8fbe3228400f' // bluefield
          : '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48', // azure-dev
      groups: ['defaultGroup'],
      roles: [],
      project: App.tenant,
      tokenId: 'discover-e2e',
      userId,
    }),
    headers,
  }).then((response: any): Record<string, string> => {
    return {
      ...rawHeaders,
      Authorization: `Bearer ${response.id_token}`,
    };
  });
};
