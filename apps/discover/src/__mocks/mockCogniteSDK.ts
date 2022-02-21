import { setClient } from 'utils/getCogniteSDKClient';

import { MockedCogniteClient } from '__mocks/MockedCogniteClient';

jest.mock('@cognite/sdk', () => {
  const CogniteClient = MockedCogniteClient;
  return { CogniteClient };
});

// @ts-expect-error 74 missing properties
setClient(new MockedCogniteClient());

export {};
