import { IDataModelsApiService } from './boundaries';
import { DataModelsHandler } from './data-models-handler';

describe('SolutionsHandlerTest', () => {
  const solutionProviderMock = {
    list: jest.fn().mockImplementation(() => Promise.resolve([])),
    create: jest.fn().mockImplementation(() => Promise.resolve([])),
    delete: jest.fn().mockImplementation(() => Promise.resolve([])),
    fetch: jest.fn(),
  } as IDataModelsApiService;

  const createInstance = () => {
    return new DataModelsHandler(solutionProviderMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch solutions', async () => {
    const service = createInstance();
    await service.list();
    expect(solutionProviderMock.list).toBeCalled();
  });

  it('should create solution', async () => {
    const service = createInstance();
    const reqDto = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(solutionProviderMock.create).toBeCalledWith(reqDto);
  });

  it('should delete solution', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(solutionProviderMock.delete).toBeCalledWith(reqDto);
  });
});
