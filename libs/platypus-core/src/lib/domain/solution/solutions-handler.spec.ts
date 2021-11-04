import { SolutionsHandler } from './solutions-handler';
import { ISolutionsApiService } from './types';

describe('SolutionsHandlerTest', () => {
  const solutionProviderMock = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as ISolutionsApiService;

  const createInstance = () => {
    return new SolutionsHandler(solutionProviderMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch solutions from list provider', async () => {
    const service = createInstance();
    await service.list();
    expect(solutionProviderMock.list).toBeCalled();
  });
});
