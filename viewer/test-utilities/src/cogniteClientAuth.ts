/*
 * Copyright 2022 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';

import type { Mock } from 'vitest';
import { vi } from 'vitest';

export function mockClientAuthentication(client: CogniteClient): Mock<() => Promise<string | undefined>> {
  const spy = vi.spyOn(client, 'authenticate').mockImplementation(() => Promise.resolve('dummy'));
  return spy;
}
