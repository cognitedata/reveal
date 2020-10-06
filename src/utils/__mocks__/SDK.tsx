/* eslint-disable @typescript-eslint/no-unused-vars */
import { CogniteClient } from '@cognite/sdk';

const client = () => ({
  get: jest.fn(),
  post: jest.fn(),
  files: { list: jest.fn(), retrieve: jest.fn() },
});

export const getSDK = () => {
  return client();
};

export const setSDK = (_: CogniteClient) => {
  // noop
};
