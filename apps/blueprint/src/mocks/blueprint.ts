import { BlueprintDefinition } from 'typings';

export const MOCK_BLUEPRINT: BlueprintDefinition = {
  id: 'mock',
  createdBy: {
    uid: '1',
    email: 'dan.levings@cognite.com',
  },
  externalId: 'mock_blueprint',
  lastOpened: Date.now(),
  name: 'Mock Blueprint',
  nonPDFFiles: [],
  timeSeriesTags: [
    {
      id: '1',
      timeSeriesReference: {
        externalId: '0071a2a6-0bac-4e54-b504-a9a092b55bec',
      },
      tagPosition: {
        x: 500,
        y: 500,
      },
      pointerPosition: {
        x: 900,
        y: 900,
      },
      color: '#D46AE2',
      rule: {
        type: 'LIMIT',
        min: 0,
        max: 100,
      },
      link: {
        URL: 'google.com',
      },
    },
  ],
  ornateJSON: {
    documents: [],
    connectedLines: [],
  },
};
