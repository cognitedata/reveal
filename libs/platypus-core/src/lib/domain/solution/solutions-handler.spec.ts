import { ISolutionsApiService } from './boundaries';
import { SolutionsHandler } from './solutions-handler';

describe('SolutionsHandlerTest', () => {
  const solutionProviderMock = {
    listTemplateGroups: jest.fn().mockImplementation(() => Promise.resolve([])),
    createTemplateGroup: jest
      .fn()
      .mockImplementation(() => Promise.resolve([])),
    deleteTemplateGroup: jest
      .fn()
      .mockImplementation(() => Promise.resolve([])),
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
    expect(solutionProviderMock.listTemplateGroups).toBeCalled();
  });

  it('should create solution', async () => {
    const service = createInstance();
    const reqDto = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(solutionProviderMock.createTemplateGroup).toBeCalledWith(reqDto);
  });

  it('should delete solution', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(solutionProviderMock.deleteTemplateGroup).toBeCalledWith(reqDto);
  });
});
