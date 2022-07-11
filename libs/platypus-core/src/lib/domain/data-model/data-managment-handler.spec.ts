/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataManagementHandler } from './data-managment-handler';
import { MixerApiQueryBuilderService } from './services';

describe('DataManagementHandlerTest', () => {
  const queryBuilderMock = {
    buildQuery: jest
      .fn()
      .mockImplementation(
        () => 'query { listTestOperationName { externalId } }'
      ),
    getOperationName: jest.fn().mockImplementation(() => 'TestOperationName'),
  } as any as MixerApiQueryBuilderService;

  const fetchDataResponseMock = {
    items: [],
    pageInfo: {
      cursor: 'abcd',
      hasNextPage: true,
    },
  };

  const solutionSchemaServiceMock = {
    runQuery: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          TestOperationName: fetchDataResponseMock,
        },
      })
    ),
  } as any;

  const mockTransformation = {
    id: 123,
    name: 't_Test_Type_1',
    externalId: 'Test',
    destination: {
      type: 'alpha_data_model_instances',
      modelExternalId: 'Type_1',
      spaceExternalId: 'Test',
      instanceSpaceExternalId: 'Test',
    },
  };
  const transformationApiMock = {
    createTransformation: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation)),
    getTransformationsForType: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation)),
  } as any;

  const createInstance = () => {
    return new DataManagementHandler(
      queryBuilderMock,
      solutionSchemaServiceMock,
      transformationApiMock
    );
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data', async () => {
    const service = createInstance();
    const mockType = {
      name: 'Person',
      fields: [],
    };

    const response = await service.fetchData({
      cursor: 'abcd',
      dataModelType: mockType,
      hasNextPage: true,
      limit: 100,
      dataModelId: 'testExternalId',
      version: '1',
    });
    expect(queryBuilderMock.buildQuery).toBeCalled();
    expect(solutionSchemaServiceMock.runQuery).toBeCalled();
    expect(response.isSuccess).toBe(true);
    expect(response.getValue().items).toEqual(fetchDataResponseMock.items);
  });
  it('should create transformation', async () => {
    const service = createInstance();
    const response = await service.createTransformation({
      name: 't_Test_Type_1',
      externalId: 'Test',
      destination: {
        type: 'alpha_data_model_instances',
        modelExternalId: 'Type_1',
        spaceExternalId: 'Test',
        instanceSpaceExternalId: 'Test',
      },
    });
    expect(response.id).toEqual(123);
  });
  it('should get transformation from list', async () => {
    const service = createInstance();
    const response = await service.getTransformations('Type', 'Test');
    expect(transformationApiMock.getTransformationsForType).toBeCalled();
    expect(response).toEqual(mockTransformation);
    expect(response.externalId).toEqual('Test');
  });
});
