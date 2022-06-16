/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryBuilderService } from './boundaries';
import { DataManagmentHandler } from './data-managment-handler';

describe('DataManagmentHandlerTest', () => {
  const queryBuilderMock = {
    buildQuery: jest
      .fn()
      .mockImplementation(
        () => 'query { listTestOperationName { externalId } }'
      ),
    getOperationName: jest.fn().mockImplementation(() => 'TestOperationName'),
  } as IQueryBuilderService;

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

  const createInstance = () => {
    return new DataManagmentHandler(
      queryBuilderMock,
      solutionSchemaServiceMock
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
});
