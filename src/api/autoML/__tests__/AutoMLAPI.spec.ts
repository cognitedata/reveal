import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import {
  mockCogniteAutoMLModelList,
  mockCogniteAutoMLModel,
} from 'src/__test-utils/fixtures/automlModels';
import { HttpResponse, v3Client } from '@cognite/cdf-sdk-singleton';

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  v3Client: {
    get: jest.fn(),
    project: 'test',
    getBaseUrl: () => 'url',
  },
}));

describe('AutoML API: /automl/list', () => {
  test('should return list of models', async () => {
    const mockedData = {
      data: { items: mockCogniteAutoMLModelList },
      status: 200,
      headers: {},
    };
    v3Client.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.listAutoMLModels();

    expect(json).toMatchObject(mockCogniteAutoMLModelList);
  });

  test('should return empty list of models', async () => {
    const mockedData = {
      data: { items: [] },
      status: 200,
      headers: {},
    };
    v3Client.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.listAutoMLModels();

    expect(json).toMatchObject([]);
  });

  test('should return empty list when items does not exist', async () => {
    const mockedData = {
      data: {},
      status: 200,
      headers: {},
    };
    v3Client.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.listAutoMLModels();

    expect(json).toMatchObject([]);
  });
});

describe('AutoML API /automl/jobid', () => {
  test('should return specified model', async () => {
    const mockedData = {
      data: mockCogniteAutoMLModel[0],
      status: 200,
      headers: {},
    };
    v3Client.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.getAutoMLModel(0);

    expect(json).toMatchObject(mockCogniteAutoMLModel[0]);
  });

  test('should return empty object when model not found', async () => {
    const mockedData = {
      data: undefined,
      status: 200,
      headers: {},
    };
    v3Client.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.getAutoMLModel(2);

    expect(json).toMatchObject({});
  });
});
