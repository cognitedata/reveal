import { FlexibleDataModelingClient } from './boundaries';
import { DataModelsHandler } from './data-models-handler';
import { CreateDataModelDTO } from './dto';

describe('DataModelsHandlerTest', () => {
  const fdmClientMock = {
    createDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
    listDataModels: jest.fn().mockImplementation(() => Promise.resolve([])),
    updateDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
    deleteDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
  } as any as FlexibleDataModelingClient;

  const createInstance = () => {
    return new DataModelsHandler(fdmClientMock);
  };

  it('should work', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should fetch data models', async () => {
    const service = createInstance();
    await service.list();
    expect(fdmClientMock.listDataModels).toBeCalled();
  });

  it('should create data model with auto external ID', async () => {
    const service = createInstance();
    const reqDto: CreateDataModelDTO = {
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(fdmClientMock.createDataModel).toBeCalledWith(
      expect.objectContaining(reqDto)
    );
  });

  it('should create data model with user-defined external ID', async () => {
    const service = createInstance();
    const reqDto: CreateDataModelDTO = {
      externalId: 'test_data_model',
      name: 'test group',
      description: 'some random description',
      owner: 'test-user@cognite.com',
    };
    await service.create(reqDto);
    expect(fdmClientMock.createDataModel).toBeCalledWith(
      expect.objectContaining(reqDto)
    );
  });

  it('should delete data model', async () => {
    const service = createInstance();
    const reqDto = {
      id: 'test group',
    };
    await service.delete(reqDto);
    expect(fdmClientMock.deleteDataModel).toBeCalledWith(reqDto);
  });
});
