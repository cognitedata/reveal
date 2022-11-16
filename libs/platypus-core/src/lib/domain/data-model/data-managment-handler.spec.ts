/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlexibleDataModelingClient } from './boundaries';
import { DataManagementHandler } from './data-managment-handler';

describe('DataManagementHandlerTest', () => {
  const fetchDataResponseMock = {
    items: [],
    pageInfo: {
      cursor: 'abcd',
      hasNextPage: true,
    },
  };

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

  const fdmClientMock = {
    createTransformation: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation[0])),
    getTransformations: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockTransformation)),
    fetchData: jest
      .fn()
      .mockImplementation(() => Promise.resolve(fetchDataResponseMock)),
    fetchPublishedRowsCount: jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        Person: 0,
        Cars: 0,
      })
    ),
    ingestNodes: jest.fn().mockImplementation(() => Promise.resolve()),
  } as any as FlexibleDataModelingClient;

  const createInstance = () => {
    return new DataManagementHandler(fdmClientMock);
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

    expect(fdmClientMock.fetchData).toBeCalled();
    expect(response.isSuccess).toBe(true);
    expect(response.getValue().items).toEqual(fetchDataResponseMock.items);
  });

  it('should fetch published rows count', async () => {
    const service = createInstance();

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
    expect(fdmClientMock.getTransformations).toBeCalled();
    expect(response).toEqual(mockTransformation);
    expect(response.length).toEqual(1);
  });
});
