import { DataModelDataMapper } from './data-model-data-mapper';

describe('DataModelDataMapper Test', () => {
  const createInstance = () => {
    return new DataModelDataMapper();
  };

  const mockDto = {
    externalId: 'testDataModel',
    name: 'Test DataModel',
    description: 'Test DataModel',
    owners: [],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const mockDataModel = {
    createdTime: 1635936707155,
    description: 'Test DataModel',
    id: 'testDataModel',
    name: 'Test DataModel',
    owners: [],
    updatedTime: 1635936707155,
    version: '',
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should serialize DataModel into dto', () => {
    const service = createInstance();
    const response = service.serialize(mockDataModel);
    expect(response).toEqual({
      externalId: 'testDataModel',
      name: 'testDataModel',
      description: 'Test DataModel',
      createdTime: 1635936707155,
    });
  });

  it('should deserialize response into DataModel', () => {
    const service = createInstance();
    const response = service.deserialize(mockDto);
    expect(response).toEqual(mockDataModel);
  });
});
