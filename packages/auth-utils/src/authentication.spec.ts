import { CogniteClient } from '@cognite/sdk-v5';
import { saveToLocalStorage } from '@cognite/storage';

import { FAKE_IDP_LS_KEY } from './fakeIdP';
import CogniteAuth from './authentication';

jest.mock('./fakeIdP', () => {
  const originalModule = jest.requireActual('./fakeIdP');

  return {
    __esModule: true,
    ...originalModule,
    doFakeIdPLogin: () => Promise.resolve(),
  };
});

jest.mock('@cognite/sdk-v5', () => ({
  CogniteClient: () => ({
    getCDFToken: () => 'test-accessToken',
    get: () => Promise.resolve({ data: { projects: ['test'] } }),
    loginWithOAuth: () => Promise.resolve(true),
    setBaseUrl: jest.fn(),
    authenticate: () => true,
    login: {
      status: () => ({
        project: 'test',
        user: 'test@email.com',
      }),
    },
  }),
}));

describe('CogniteAuth', () => {
  let client: CogniteClient;
  let auth: CogniteAuth;

  describe('FAKE_IDP', () => {
    beforeEach(() => {
      client = new CogniteClient({ appId: 'test' });
      auth = new CogniteAuth(client, {
        appName: 'test-app',
        flow: 'FAKE_IDP',
      });

      saveToLocalStorage(FAKE_IDP_LS_KEY, {
        idToken: 'idToken',
        accessToken: 'accessToken',
        project: 'project',
        cluster: 'cluster',
      });
    });

    test('FAKE_IDP flow - loginAndAuthIfNeeded', async () => {
      await auth.loginAndAuthIfNeeded({
        flow: 'FAKE_IDP',
        project: 'test-project',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });

    test('FAKE_IDP flow - loginInitial', async () => {
      await auth.loginInitial({
        flow: 'FAKE_IDP',
        cluster: 'test-cluster',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });

    test('FAKE_IDP flow - login - no local state', async () => {
      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });
  });

  describe('AZURE_AD', () => {
    beforeEach(() => {
      client = new CogniteClient({ appId: 'ad-test' });
      auth = new CogniteAuth(client, {
        appName: 'test-ad-app',
        flow: 'AZURE_AD',
      });
    });

    test('AZURE_AD flow - initial state - loginAndAuthIfNeeded', async () => {
      await auth.loginAndAuthIfNeeded({
        flow: 'AZURE_AD',
        project: 'test-project',
      });
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });
  });

  describe('COGNITE_AUTH', () => {
    beforeEach(() => {
      client = new CogniteClient({ appId: 'test' });
      auth = new CogniteAuth(client, {
        appName: 'test-app',
        flow: 'COGNITE_AUTH',
      });
    });

    test('Make sure CogniteAuth can be constructed', () => {
      auth = new CogniteAuth(client);
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    test('COGNITE_AUTH flow - loginAndAuthIfNeeded', async () => {
      await auth.loginAndAuthIfNeeded({
        flow: 'COGNITE_AUTH',
        project: 'test-project',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        project: 'test-project',
        email: 'test@email.com',
        authResult: {
          authFlow: 'COGNITE_AUTH',
          accessToken: 'test-accessToken',
        },
      });
    });

    test('COGNITE_AUTH flow - loginInitial', async () => {
      await auth.loginInitial({
        flow: 'COGNITE_AUTH',
        cluster: 'test-cluster',
      });
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    test('COGNITE_AUTH flow - login - no local state', async () => {
      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    // -@todo this test is not finished
    test('COGNITE_AUTH flow - login - good local state', async () => {
      jest.mock('./utils', () => ({
        getFlow: () => ({
          flow: 'COGNITE_AUTH',
        }),
      }));

      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });
  });

  describe('Misc', () => {
    test('getProjects', async () => {
      const result = await auth.getProjects();
      expect(result).toEqual(['test']);
    });

    test('getError/setError', () => {
      // @ts-expect-error private
      auth.setError('test');
      expect(auth.state.error).toEqual(true);
      // @ts-expect-error private
      auth.resetError();
      expect(auth.state.error).toEqual(false);
    });

    test('logout', () => {
      // @ts-expect-error private options
      auth.options.cluster = 'test-cluster';
      expect(auth.getCluster()).toEqual('test-cluster');
      // @ts-expect-error fake field
      auth.getClient().test = true;
      // @ts-expect-error fake field
      expect(auth.getClient().test).toEqual(true);

      auth.logout();

      // @ts-expect-error fake field
      expect(auth.getClient().test).toEqual(undefined);

      // cluster is NOT reset after logout
      expect(auth.getCluster()).toEqual('test-cluster');
    });
  });
});
