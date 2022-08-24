import { Asset } from '@cognite/sdk';

export const rootAssetsMock: Asset[] = [
  {
    id: 1,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    externalId: 'a',
    name: 'A',
    rootId: 0,
  },
  {
    id: 2,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    externalId: 'b',
    name: 'B',
    rootId: 0,
  },
  {
    id: 3,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    externalId: 'c',
    name: 'C',
    rootId: 0,
  },
];

export const rootAssetsMissingExternalIdMock: Asset[] = [
  {
    id: 1,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    name: 'A',
    rootId: 0,
  },
  {
    id: 2,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    externalId: 'b',
    name: 'B',
    rootId: 0,
  },
  {
    id: 3,
    lastUpdatedTime: new Date(0),
    createdTime: new Date(0),
    name: 'C',
    rootId: 0,
  },
];
