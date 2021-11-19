import axios from 'axios';
import omit from 'lodash/omit';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';

export type FakeIdp = {
  cluster: string;
  customExpiry?: number;
  fakeApplicationId: string;
  groups: string[];
  name?: string;
  otherAccessTokenFields: Record<string, string>;
  otherIdTokenFields: Record<string, string>;
  project: string;
  userId?: string;
  tokenId?: string;
  roles: string[];
};

export const FAKE_IDP_LS_KEY = 'fakeIdp';

export const getFakeIdPInfoFromStorage = () =>
  getFromLocalStorage<FakeIdp & { idToken: string; accessToken: string }>(
    FAKE_IDP_LS_KEY
  );

export const doFakeIdPLogin = (options: FakeIdp) => {
  const excludeList = ['idToken', 'accessToken', 'name'];
  const goodOptions = omit(options, ...excludeList);
  return axios
    .post(`http://localhost:8200/login/token`, {
      ...goodOptions,
      // for testing expired tokens:
      // customExpiry: Math.floor(new Date().getTime() / 1000) + 15, // 15 second token
    })
    .then((result) => {
      saveToLocalStorage(FAKE_IDP_LS_KEY, {
        ...goodOptions,
        idToken: result.data.id_token,
        accessToken: result.data.access_token,
      });

      return result;
    });
};
