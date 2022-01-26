import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import {
  mockCogniteAutoMLModelList,
  mockCogniteAutoMLModel,
  mockCogniteAutoMLTrainingJob,
} from 'src/__test-utils/fixtures/automlModels';
import { HttpResponse, v3Client } from '@cognite/cdf-sdk-singleton';
import { AutoMLModelType } from 'src/api/autoML/types';

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

describe('AutoML start training job', () => {
  test('should return training job data', async () => {
    const mockedData = {
      data: mockCogniteAutoMLTrainingJob[0],
      status: 200,
      headers: {},
    };

    const { name, modelType, items } = mockCogniteAutoMLTrainingJob[0];

    v3Client.post = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.startAutoMLJob(
      name,
      modelType as AutoMLModelType,
      items
    );

    expect(json).toMatchObject(mockCogniteAutoMLTrainingJob[0]);
  });

  test('should return empty object when job creation fails', async () => {
    const mockedData = {
      data: undefined,
      status: 200,
      headers: {},
    };
    const { name, modelType, items } = mockCogniteAutoMLTrainingJob[0];
    v3Client.post = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.startAutoMLJob(
      name,
      modelType as AutoMLModelType,
      items
    );
    expect(json).toMatchObject({});
  });
});
