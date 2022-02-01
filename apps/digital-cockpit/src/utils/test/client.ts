import { createApiClient, createClient, ApiClient } from 'utils';
import { CdfClient } from 'utils/cdfClient';
import {
  CogniteExternalId,
  DataSet,
  FileLink,
  IdEither,
  FileInfo,
} from '@cognite/sdk';

import { cogniteClient } from './cognite-client';

export const createMockCdfClient = (): CdfClient => {
  const cdfClient = createClient(
    {
      appId: 'unit-tests',
      dataSetName: '',
    },
    cogniteClient
  );
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
