import { CogniteClient } from '@cognite/sdk';

import CogniteAuth from './authentication';

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
});
