import { IDataModelsApiService } from './boundaries';
import { DataModelsHandler } from './data-models-handler';

describe('DataModelsHandlerTest', () => {
  const dataModelsProviderMock = {
    list: jest.fn().mockImplementation(() => Promise.resolve([])),
    create: jest.fn().mockImplementation(() => Promise.resolve([])),
    delete: jest.fn().mockImplementation(() => Promise.resolve([])),
    fetch: jest.fn(),
  } as IDataModelsApiService;

  const createInstance = () => {
    return new DataModelsHandler(dataModelsProviderMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data models', async () => {
    const service = createInstance();
    await service.list();
    expect(dataModelsProviderMock.list).toBeCalled();
  });

  it('should create data model', async () => {
    const service = createInstance();
    const reqDto = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(dataModelsProviderMock.create).toBeCalledWith(reqDto);
  });

  it('should delete data model', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(dataModelsProviderMock.delete).toBeCalledWith(reqDto);
  });
});
