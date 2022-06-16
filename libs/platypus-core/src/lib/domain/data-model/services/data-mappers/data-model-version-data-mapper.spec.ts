import { DataModelVersionStatus } from '../../types';
import { DataModelVersionDataMapper } from './data-model-version-data-mapper';

describe('DataModelVersionDataMapperTest', () => {
  const createInstance = () => {
    return new DataModelVersionDataMapper();
  };

  const dataModelVersionMock = {
    version: 1,
    createdTime: '2022-05-12T07:46:48.206Z',
    lastUpdatedTime: '2022-05-12T07:46:48.206Z',
    dataModel: {
      version: 1,
      createdTime: '2022-05-12T07:46:48.206Z',
      graphqlRepresentation: `type Person { firstName: string }`,
      types: [],
    },
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should deserialize response into data model version', () => {
    const service = createInstance();
    expect(service.deserialize('123', dataModelVersionMock)).toEqual({
      version: '1',
      externalId: '123',
      status: DataModelVersionStatus.PUBLISHED,
      schema: `type Person { firstName: string }`,
      createdTime: 1652341608206,
      lastUpdatedTime: 1652341608206,
    });
  });
});
