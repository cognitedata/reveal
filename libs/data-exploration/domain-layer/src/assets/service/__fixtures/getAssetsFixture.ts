import { Asset } from '@cognite/sdk';

export const getAssetsFixture = (): Asset[] => {
  return [
    {
      createdTime: new Date('2022-09-09T10:27:01.284Z'),
      lastUpdatedTime: new Date('2022-09-09T10:27:01.284Z'),
      rootId: 1918823365845105,
      parentId: 235668580962934,
      parentExternalId: '23-PC-9109',
      externalId: '23-PC-9109-M01',
      name: '23-PC-9109-M01',
      metadata: {},
      id: 73715121652,
    },
    {
      createdTime: new Date('2022-09-09T10:27:00.493Z'),
      lastUpdatedTime: new Date('2022-09-09T10:27:00.493Z'),
      rootId: 1918823365845105,
      parentId: 2725990319116737,
      parentExternalId: '23-ESDV-92551A',
      externalId: '23-EZSL-92551A',
      name: '23-EZSL-92551A',
      metadata: {},
      id: 10831200545643,
    },
  ];
};
