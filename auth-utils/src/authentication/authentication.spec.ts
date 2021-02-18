import { CogniteClient } from '@cognite/sdk';

import CogniteAuth from './authentication';

jest.mock('@cognite/sdk', () => {
  return {
    CogniteClient: () => {
      return {
        loginWithOAuth: ({ onTokens }: { onTokens: (a: unknown) => void }) => {
          onTokens({
            testToken: '123',
          });
        },
        setBaseUrl: jest.fn(),
        authenticate: () => true,
        login: {
          status: () => {
            return {
              project: 'test',
            };
          },
        },
      };
    },
  };
});

describe('CogniteAuth', () => {
  it('Make sure CogniteAuth can be constructed', () => {
    const client = new CogniteClient({ appId: 'test' });
    const auth = new CogniteAuth(client);
    expect(auth.state).toMatchObject({
      authenticated: false,
      error: false,
      initialized: false,
      initializing: false,
    });
  });

  it('COGNITE_AUTH flow', async () => {
    const client = new CogniteClient({ appId: 'test' });
    const auth = new CogniteAuth(client, { flow: 'COGNITE_AUTH' });
    await auth.loginAndAuthIfNeeded('COGNITE_AUTH', 'test-project');
    expect(auth.state).toMatchObject({
      authenticated: true,
      error: false,
      initialized: true,
      initializing: false,
      project: 'test',
      authResult: { authFlow: 'COGNITE_AUTH', testToken: '123' },
    });
  });
});
