import { Document } from 'domain/documents';

// This is the normalized version (Document) of DocumentSearchItem from sdk.
export const documents: Document[] = [
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

    lastUpdatedTime: new Date().getTime(),
    createdTime: new Date().getTime(),
    sourceFile: {
      name: 'SKA-AK-P-XB-2930-001.png',
      datasetId: 2980543378855428,
    },
  },

  {
    id: 2,
    externalId: 'random.pdf',
    name: 'random long name for pdf.pdf',
    mimeType: 'application/pdf',
    assetIds: [8220256008593149],
    sourceFile: {
      name: 'random.pdf',
      datasetId: 2980543378855428,
    },
    lastUpdatedTime: new Date().getTime(),
    createdTime: new Date().getTime(),
  },
];
