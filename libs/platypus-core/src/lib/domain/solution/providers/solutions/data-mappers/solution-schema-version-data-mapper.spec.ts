import { SolutionSchemaStatus } from '../../../types';
import { SolutionSchemaVersionDataMapper } from './solution-schema-version-data-mapper';

describe('SolutionSchemaVersionDataMapperTest', () => {
  const createInstance = () => {
    return new SolutionSchemaVersionDataMapper();
  };

  const templateSchemaMock = {
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

  it('should deserialize response into solution schema', () => {
    const service = createInstance();
    expect(service.deserialize('123', templateSchemaMock)).toEqual({
      version: '1',
      externalId: '123',
      status: SolutionSchemaStatus.PUBLISHED,
      schema: `type Person { firstName: string }`,
      createdTime: 1652341608206,
      lastUpdatedTime: 1652341608206,
    });
  });
});
