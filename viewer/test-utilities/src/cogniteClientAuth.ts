/*
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

import { jest } from '@jest/globals';

export function mockClientAuthentication(client: CogniteClient): jest.SpiedFunction<() => Promise<string | undefined>> {
  const spy = jest.spyOn(client, 'authenticate').mockImplementation(() => Promise.resolve('dummy'));
  return spy;
}
