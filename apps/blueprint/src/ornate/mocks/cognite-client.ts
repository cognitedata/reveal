import { CogniteClient } from '@cognite/sdk';

export const getMockClient = () => {
  const mockClient = new CogniteClient({
    apiKeyMode: true,
    appId: '',
    project: 'fusion',
    getToken: async () => '',
  });
  mockClient.files.getDownloadUrls = async () => [
    { downloadUrl: 'test', externalId: '' },
  ];
  // The type here is terrible to try and mock
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockClient.events.list = async () => ({
    items: [
      {
        id: 1234,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        metadata: {
          CDF_ANNOTATION_box: JSON.stringify({
            xMin: 0.1,
            xMax: 0.2,
            yMin: 0.1,
            yMax: 0.2,
          }),
          CDF_ANNOTATION_resource_type: 'asset',
        },
      },
      {
        id: 5677,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        metadata: {
          CDF_ANNOTATION_box: JSON.stringify({
            xMin: 0.5,
            xMax: 0.7,
            yMin: 0.5,
            yMax: 0.7,
          }),
          CDF_ANNOTATION_resource_type: 'file',
        },
      },
    ],
  });
  return mockClient;
};
