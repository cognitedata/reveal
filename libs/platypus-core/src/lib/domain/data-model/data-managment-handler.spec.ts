/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataManagementHandler } from './data-managment-handler';
import { MixerQueryBuilder } from './services/mixer-api';

describe('DataManagementHandlerTest', () => {
  const queryBuilderMock = {
    buildQuery: jest
      .fn()
      .mockImplementation(
        () => 'query { listTestOperationName { externalId } }'
      ),
    getOperationName: jest.fn().mockImplementation(() => 'TestOperationName'),
  } as any as MixerQueryBuilder;

  const fetchDataResponseMock = {
    items: [],
    pageInfo: {
      cursor: 'abcd',
      hasNextPage: true,
    },
  };

  const mixerApiServiceMock = {
    runQuery: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          TestOperationName: fetchDataResponseMock,
        },
      })
    ),
  } as any;

  const mockTransformation = [
    {
      id: 123,
      name: 't_Test_Type_1',
      externalId: 'Test',
      destination: {
        type: 'data_model_instances',
        modelExternalId: 'Type_1',
        spaceExternalId: 'Test',
        instanceSpaceExternalId: 'Test',
      },
    },
  ];

  const transformationApiServiceMock = {
    createTransformation: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation[0])),
    getTransformationsForType: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation)),
  } as any;

  const dmsApiServiceMock = {
    ingestNodes: jest.fn().mockImplementation(() => Promise.resolve()),
  } as any;

  const createInstance = () => {
    return new DataManagementHandler(
      queryBuilderMock,
      mixerApiServiceMock,
      transformationApiServiceMock,
      dmsApiServiceMock
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
      dataModelTypeDefs: { types: [mockType] },
      hasNextPage: true,
      limit: 100,
      dataModelId: 'testExternalId',
      version: '1',
      relationshipFieldsLimit: 3,
    });
    expect(queryBuilderMock.buildQuery).toBeCalled();
    expect(mixerApiServiceMock.runQuery).toBeCalled();
    expect(response.isSuccess).toBe(true);
    expect(response.getValue().items).toEqual(fetchDataResponseMock.items);
  });

  it('should fetch published rows count', async () => {
    const service = createInstance();

    mixerApiServiceMock.runQuery.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          aggregatePerson: {
            items: [],
          },
          aggregateCars: {
            items: [],
          },
        },
      })
    );

    const response = await service.fetchPublishedRowsCount({
      dataModelTypes: [],
      dataModelId: 'testExternalId',
      version: '1',
    });
    expect(response.isSuccess).toBe(true);
    expect(response.getValue()).toEqual({
      Person: 0,
      Cars: 0,
    });
  });

  it('should create transformation', async () => {
    const service = createInstance();
    const response = await service.createTransformation({
      name: 't_Test_Type_1',
      externalId: 'Test',
      destination: {
        type: 'data_model_instances',
        modelExternalId: 'Type_1',
        spaceExternalId: 'Test',
        instanceSpaceExternalId: 'Test',
      },
    });
    expect(response.id).toEqual(123);
  });

  it('should get transformation from list', async () => {
    const service = createInstance();
    const response = await service.getTransformations({
      dataModelExternalId: 'Test',
      typeName: 'Type',
      version: '1',
    });
    expect(transformationApiServiceMock.getTransformationsForType).toBeCalled();
    expect(response).toEqual(mockTransformation);
    expect(response.length).toEqual(1);
  });
});
