import { Result } from '../../boundaries/types';

import { FlexibleDataModelingClient } from './boundaries';
import { DataModelsHandler } from './data-models-handler';
import { CreateDataModelDTO } from './dto';
import { DataModelsApiService } from './providers/fdm-next';
import { SpaceDTO } from './types';

describe('DataModelsHandlerTest', () => {
  const fdmClientMock = {
    createDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
    listDataModels: jest.fn().mockImplementation(() => Promise.resolve([])),
    updateDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
    deleteDataModel: jest.fn().mockImplementation(() => Promise.resolve([])),
    getSpaces: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve([{ space: 'test-space', name: 'Test_Space_Name' }])
      ),
    createSpace: jest
      .fn()
      .mockImplementation((dto: SpaceDTO) => Promise.resolve(dto)),
  } as any as FlexibleDataModelingClient;
  const dataModelsServiceMock = {
    fetchDataModelFromDMS: jest
      .fn()
      .mockImplementation(() => Promise.resolve([])),
  } as any as DataModelsApiService;

  const createInstance = () => {
    return new DataModelsHandler(fdmClientMock, dataModelsServiceMock);
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
      externalId: 'test group',
      space: 'space',
    };
    await service.delete(reqDto, true);
    expect(fdmClientMock.deleteDataModel).toBeCalledWith(reqDto, true);
  });

  it('should fetch all spaces', async () => {
    const service = createInstance();
    const result = await service.getSpaces();
    const spaces = result.getValue();

    expect(fdmClientMock.getSpaces).toBeCalled();
    expect(spaces).toStrictEqual([
      { space: 'test-space', name: 'Test_Space_Name' },
    ]);
  });

  it('should create new space', async () => {
    const service = createInstance();
    const result = await service.createSpace({
      space: 'testSpace',
      name: 'testSpaceName',
    });
    const newSpace = result.getValue();

    expect(fdmClientMock.createSpace).toBeCalledWith({
      space: 'testSpace',
      name: 'testSpaceName',
    });
    expect(newSpace).toStrictEqual({
      space: 'testSpace',
      name: 'testSpaceName',
    });
  });
});
