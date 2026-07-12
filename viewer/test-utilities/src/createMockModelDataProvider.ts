/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import type { ModelDataProvider } from '../../packages/data-providers';

export function createMockModelDataProvider(overrides: Partial<ModelDataProvider> = {}): ModelDataProvider {
  return {
    getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(8)),
    getJsonFile: vi.fn(async () => ({})),
    getFileUrlsForModel: vi.fn(async () => []),
    ...overrides
  };
}
