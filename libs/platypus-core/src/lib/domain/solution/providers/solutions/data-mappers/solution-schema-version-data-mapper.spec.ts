import { SolutionSchemaStatus } from '../../../types';
import { SolutionSchemaVersionDataMapper } from './solution-schema-version-data-mapper';

describe('SolutionSchemaVersionDataMapperTest', () => {
  const createInstance = () => {
    return new SolutionSchemaVersionDataMapper();
  };

  const templateSchemaMock = {
    version: 1,
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
    dataModel: {
      version: 1,
      createdTime: 1635936707155,
      graphqlRepresentation: `type Person { firstName: string }`,
      types: [],
    },
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should deserialize response into solution schema', () => {
    const service = createInstance();
    expect(service.deserialize('123', templateSchemaMock)).toEqual({
      version: '1',
      externalId: '123',
      status: SolutionSchemaStatus.PUBLISHED,
      schema: `type Person { firstName: string }`,
      createdTime: 1635936707155,
      lastUpdatedTime: 1635936707155,
    });
  });
});
