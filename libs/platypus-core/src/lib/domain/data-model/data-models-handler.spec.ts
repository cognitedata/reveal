import { DataModelsHandler } from './data-models-handler';
import { MixerApiService, DmsApiService } from './services';

describe('DataModelsHandlerTest', () => {
  const mixerApiMock = {
    getApisByIds: jest.fn().mockImplementation(() => Promise.resolve([])),
    listApis: jest.fn().mockImplementation(() => Promise.resolve([])),
    upsertApi: jest.fn().mockImplementation(() => Promise.resolve([])),
    deleteApi: jest.fn().mockImplementation(() => Promise.resolve([])),
  } as any as MixerApiService;

  const dmsApiMock = {
    applySpaces: jest.fn().mockImplementation(() => Promise.resolve([])),
  } as any as DmsApiService;

  const createInstance = () => {
    return new DataModelsHandler(mixerApiMock, dmsApiMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data models', async () => {
    const service = createInstance();
    await service.list();
    expect(mixerApiMock.listApis).toBeCalled();
  });

  it('should create data model', async () => {
    const service = createInstance();
    const reqDto = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(mixerApiMock.upsertApi).toBeCalledWith(
      expect.objectContaining({
        name: reqDto.name,
        externalId: 'testGroup',
        metadata: {},
      })
    );
    expect(dmsApiMock.applySpaces).toBeCalledWith([
      { externalId: 'testGroup' },
    ]);
  });

  it('should delete data model', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(mixerApiMock.deleteApi).toBeCalledWith(reqDto.id);
  });
});
