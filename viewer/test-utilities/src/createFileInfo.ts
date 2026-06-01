import type { FileInfo } from '@cognite/sdk';

export function createFileInfo(overrides?: Partial<FileInfo>): FileInfo {
  return {
    id: 123,
    uploaded: true,
    name: 'a-file',
    createdTime: new Date('2026-06-01'),
    lastUpdatedTime: new Date('2026-06-01'),
    ...overrides
  };
}
