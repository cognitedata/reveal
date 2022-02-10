/*
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

export function mockClientAuthentication(client: CogniteClient): jest.SpyInstance<Promise<string | undefined>> {
  const spy = jest.spyOn(client, 'authenticate').mockImplementation(() => Promise.resolve('dummy'));
  return spy;
}
