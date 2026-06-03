/*
 * Copyright 2022 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';

import { vi } from 'vitest';

export function mockClientAuthentication(client: CogniteClient): vi.SpiedFunction<() => Promise<string | undefined>> {
  const spy = vi.spyOn(client, 'authenticate').mockImplementation(() => Promise.resolve('dummy'));
  return spy;
}
