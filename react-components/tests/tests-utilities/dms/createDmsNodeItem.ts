import type { DmsUniqueIdentifier, NodeItem } from '../../../src';

export function createDmsNodeItem<T extends Record<string, any>>(params?: {
  id?: DmsUniqueIdentifier;
  properties?: Record<string, Record<string, T>>;
}): NodeItem<T> {
  return {
    externalId: params?.id?.externalId ?? 'some-external-id',
    space: params?.id?.space ?? 'some-space',
    createdTime: 0,
    lastUpdatedTime: 0,
    version: 1,
    instanceType: 'node',
    properties: params?.properties ?? {}
  };
}
