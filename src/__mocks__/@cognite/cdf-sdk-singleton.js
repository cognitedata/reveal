import { MockedCogniteClient } from 'src/__test-utils/sdk/MockedCogniteClient';

export default {
  project: 'test',
};

export const sdkv3 = new MockedCogniteClient();
