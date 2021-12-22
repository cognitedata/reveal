/*
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

export function mockClientAuthentication(client: CogniteClient): jest.SpyInstance<Promise<boolean>> {
  const spy = jest.spyOn(client, 'authenticate').mockImplementation(() => Promise.resolve(true));
  return spy;
}
