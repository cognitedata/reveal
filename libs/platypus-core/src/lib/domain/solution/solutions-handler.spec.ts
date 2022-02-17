import { ISolutionsApiService } from './boundaries';
import { SolutionsHandler } from './solutions-handler';

describe('SolutionsHandlerTest', () => {
  const solutionProviderMock = {
    listSolutions: jest.fn().mockImplementation(() => Promise.resolve([])),
    createSolution: jest.fn().mockImplementation(() => Promise.resolve([])),
    deleteSolution: jest.fn().mockImplementation(() => Promise.resolve([])),
    fetchSolution: jest.fn(),
  } as ISolutionsApiService;

  const createInstance = () => {
    return new SolutionsHandler(solutionProviderMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch solutions', async () => {
    const service = createInstance();
    await service.list();
    expect(solutionProviderMock.listSolutions).toBeCalled();
  });

  it('should create solution', async () => {
    const service = createInstance();
    const reqDto = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(solutionProviderMock.createSolution).toBeCalledWith(reqDto);
  });

  it('should delete solution', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(solutionProviderMock.deleteSolution).toBeCalledWith(reqDto);
  });
});
