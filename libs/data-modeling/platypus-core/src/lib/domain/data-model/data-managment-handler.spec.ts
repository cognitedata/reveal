/* eslint-disable @typescript-eslint/no-explicit-any */
import { Result } from '../../boundaries/types';

import { FlexibleDataModelingClient } from './boundaries';
import { DataManagementHandler } from './data-managment-handler';
import { DataModelVersionStatus } from './types';

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

  const mockSearchData = jest.fn();
  const mockGetDataById = jest.fn();

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
    searchData: mockSearchData,
    getDataByExternalId: mockGetDataById,
    fetchPublishedRowsCount: jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        Person: 0,
        Cars: 0,
      })
    ),
    fetchFilteredRowsCount: jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(0)),
    ingestNodes: jest.fn().mockImplementation(() => Promise.resolve()),
  } as any as FlexibleDataModelingClient;

  const createInstance = () => {
    return new DataManagementHandler(fdmClientMock);
  };

  it('should create the service instance successfully', () => {
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
      limit: 100,
      nestedLimit: 2,
      dataModelVersion: {
        externalId: 'testExternalId',
        version: '1',
        space: 'testSpace',
        schema: '',
        status: DataModelVersionStatus.PUBLISHED,
        views: [],
      },
    });

    expect(fdmClientMock.fetchData).toBeCalled();
    expect(response.isSuccess).toBe(true);
    expect(response.getValue().items).toEqual(fetchDataResponseMock.items);
  });

  it('should search data', async () => {
    const service = createInstance();
    const mockType = {
      name: 'Person',
      fields: [],
    };
    mockSearchData.mockImplementationOnce(() => {
      return Promise.resolve(['foo']);
    });

    const response = await service.searchData({
      dataModelType: mockType,
      dataModelTypeDefs: { types: [mockType] },
      dataModelVersion: {
        externalId: 'testExternalId',
        version: '1',
        space: 'testSpace',
        schema: '',
        status: DataModelVersionStatus.PUBLISHED,
        views: [],
      },
      limit: 100,
      searchTerm: 'lorem',
    });

    expect(response.isSuccess).toBe(true);
    expect(response.getValue()).toEqual(['foo']);
  });

  it('should get data by id', async () => {
    const service = createInstance();
    const mockType = {
      name: 'Person',
      fields: [],
    };
    mockGetDataById.mockImplementationOnce(() => {
      return Promise.resolve(['result']);
    });

    const response = await service.getDataById({
      dataModelExternalId: 'testExternalId',
      dataModelType: mockType,
      dataModelTypeDefs: { types: [mockType] },
      dataModelSpace: 'testSpace',
      instanceSpace: 'testSpace',
      version: '1',
      nestedLimit: 100,
      externalId: 'foo',
    });

    expect(response.isSuccess).toBe(true);
    expect(response.getValue()).toEqual(['result']);
  });

  it('rejects with failed Result if search fails', async () => {
    const service = createInstance();
    const mockType = {
      name: 'Person',
      fields: [],
    };
    mockSearchData.mockImplementationOnce(() => {
      return Promise.reject('search failed');
    });

    expect.assertions(1);

    try {
      await service.searchData({
        dataModelType: mockType,
        dataModelTypeDefs: { types: [mockType] },
        dataModelVersion: {
          externalId: 'testExternalId',
          version: '1',
          space: 'testSpace',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          views: [],
        },
        limit: 100,
        searchTerm: 'lorem',
      });
    } catch (error) {
      expect((error as Result<string>).errorValue()).toBe('search failed');
    }
  });

  it('should fetch published rows count', async () => {
    const service = createInstance();

    const response = await service.fetchPublishedRowsCount({
      dataModelTypes: [],
      dataModelId: 'testExternalId',
      space: 'testExternalId',
      version: '1',
    });
    expect(response.isSuccess).toBe(true);
    expect(response.getValue()).toEqual({
      Person: 0,
      Cars: 0,
    });
  });

  it('should fetch filtered rows count', async () => {
    const service = createInstance();
    const mockType = {
      name: 'Person',
      fields: [],
    };
    const response = await service.fetchFilteredRowsCount({
      dataModelType: mockType,
      dataModelId: 'testExternalId',
      version: '1',
      space: 'testExternalId',
      filter: {},
    });

    expect(response.isSuccess).toBe(true);
    expect(response.getValue()).toEqual(0);
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
      spaceExternalId: 'Test',
      instanceSpaceExternalId: 'Test',
      typeName: 'Type',
      viewVersion: '1',
    });
    expect(fdmClientMock.getTransformations).toBeCalled();
    expect(response).toEqual(mockTransformation);
    expect(response.length).toEqual(1);
  });
});
