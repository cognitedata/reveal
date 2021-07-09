import { createApiClient, createClient, ApiClient } from 'utils';
import { CdfClient } from 'utils/cdfClient';
import {
  CogniteExternalId,
  DataSet,
  FileLink,
  IdEither,
  FileInfo,
} from '@cognite/sdk';

export const createMockCdfClient = (): CdfClient => {
  const cdfClient = createClient({
    appId: 'unit-tests',
    dataSetName: '',
  });
  // Hack our way in without needing to actually do anything.
  // We need this so that we can mock CogniteClient's function without having to login
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cdfClient.cogniteClient.initAPIs();
  return {
    ...cdfClient,
    uploadFile: async () => ({
      name: '',
      id: 2,
      uploadUrl: '',
      uploaded: true,
      lastUpdatedTime: new Date(),
      createdTime: new Date(),
    }),
    deleteFiles: async (_: CogniteExternalId[]) => ({}),
    retrieveFilesMetadata: async (_: CogniteExternalId[]) => [] as FileInfo[],
    getDownloadUrls: async (_: CogniteExternalId[]) =>
      [] as (FileLink & IdEither)[],
    retrieveDataSet: async () => [] as DataSet[],
    createDataSet: async (_: CogniteExternalId) => [] as DataSet[],
  };
};

export const createMockApiClient = (): ApiClient => {
  const apiClient = createApiClient({
    appId: 'unit-tests',
    baseUrl: '',
    project: '',
  });
  return apiClient;
};
