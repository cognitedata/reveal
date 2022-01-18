// eslint-disable-next-line jest/no-mocks-import
import { MockedCogniteClient } from 'src/__mocks__/MockedCogniteClient';

export default {
  project: 'test',
};

export const sdkv3 = new MockedCogniteClient();
