import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import {
  mockCogniteAutoMLModelList,
  mockCogniteAutoMLModel,
  mockCogniteAutoMLTrainingJob,
} from 'src/__test-utils/fixtures/automlModels';
import sdk from '@cognite/cdf-sdk-singleton';
import { HttpResponse } from '@cognite/sdk';
import { AutoMLModelType } from 'src/api/autoML/types';
import { CDFResourceId } from 'src/api/types';

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  get: jest.fn(),
  project: 'test',
  getBaseUrl: () => 'url',
}));

describe('AutoML API: /automl/list', () => {
  test('should return list of models', async () => {
    const mockedData = {
      data: { items: mockCogniteAutoMLModelList },
      status: 200,
      headers: {},
    };
    sdk.get = async (): Promise<HttpResponse<any>> =>
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
    sdk.get = async (): Promise<HttpResponse<any>> =>
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
    sdk.get = async (): Promise<HttpResponse<any>> =>
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
    sdk.get = async (): Promise<HttpResponse<any>> =>
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
    sdk.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.getAutoMLModel(2);

    expect(json).toMatchObject({});
  });
});

describe('AutoML API download model', () => {
  test('should return specified model', async () => {
    const data = { modelUrl: 'https://download.com' };
    const mockedData = {
      data,
      status: 200,
      headers: {},
    };
    sdk.get = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.downloadAutoMLModel(0);

    expect(json).toMatchObject(data);
  });

  test('should return empty object when model not found', async () => {
    const mockedData = {
      data: undefined,
      status: 400,
      headers: {},
    };
    sdk.get = async (): Promise<HttpResponse<any>> =>
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

    sdk.post = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.startAutoMLJob(
      name,
      modelType as AutoMLModelType,
      items as CDFResourceId[]
    );

    expect(json).toBe(mockCogniteAutoMLTrainingJob[0]);
  });

  test('should log error and return undefined when job creation fails', async () => {
    const { name, modelType, items } = mockCogniteAutoMLTrainingJob[0];
    sdk.post = async () => {
      throw Error();
    };

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const json = await AutoMLAPI.startAutoMLJob(
      name,
      modelType as AutoMLModelType,
      items as CDFResourceId[]
    );
    expect(json).toBe(undefined);
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('AutoML delete job', () => {
  test('should delete automl model', async () => {
    const mockedData = {
      data: {},
      status: 200,
      headers: {},
    };

    sdk.post = async (): Promise<HttpResponse<any>> =>
      Promise.resolve(mockedData);
    const json = await AutoMLAPI.deleteAutoMLJob(1);

    expect(json).toMatchObject({});
  });

  test('should log error and return undefined when job deletion fails', async () => {
    sdk.post = async () => {
      throw Error();
    };

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const json = await AutoMLAPI.deleteAutoMLJob(0);
    expect(json).toBe(undefined);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
