import { FileInfo } from '@cognite/sdk';

export const files: FileInfo[] = [
  {
    id: 1,
    externalId: 'SKA-AK-P-XB-2930-001.png',
    name: 'SKA-AK-P-XB-2930-001.png',
    mimeType: 'image/png',
    assetIds: [
      560489721305992, 607065467418725, 778676031640514, 979330430071423,
      1573619286832806, 3575569724807447, 4397051466722513, 5379193160777911,
      5943881697483384, 7404541461379072, 8220256008593149,
    ],
    dataSetId: 2980543378855428,
    uploaded: true,
    uploadedTime: new Date(),
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  },
  {
    id: 2,
    externalId: 'random.pdf',
    name: 'random long name for pdf.pdf',
    mimeType: 'application/pdf',
    assetIds: [8220256008593149],
    dataSetId: 2980543378855428,
    uploaded: true,
    uploadedTime: new Date(),
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  },
];
