import type { SimpleSource } from '../../../../src';
import type { ViewItem } from '../../../../src/data-providers/FdmSDK';

export function getMockViewItemFromSimpleSource(source: SimpleSource): ViewItem {
  return {
    externalId: source.externalId,
    version: source.version,
    space: source.space,
    createdTime: 123,
    lastUpdatedTime: 124,
    writable: true,
    usedFor: 'usedFor',
    isGlobal: true,
    properties: {},
    name: 'name',
    implements: []
  };
}
