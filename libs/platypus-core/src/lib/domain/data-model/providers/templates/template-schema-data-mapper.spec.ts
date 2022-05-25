import { DataModelVersionStatus } from '../../types';
import { TemplateSchemaDataMapper } from './template-schema-data-mapper';

describe('TemplateSchemaDataMapperTest', () => {
  const createInstance = () => {
    return new TemplateSchemaDataMapper();
  };

  const templateSchemaMock = {
    version: 1,
    schema: `type Person { firstName: string }`,
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should deserialize templates schema into solution schema', () => {
    const service = createInstance();
    expect(service.deserialize('123', templateSchemaMock)).toEqual({
      version: '1',
      externalId: '123',
      status: DataModelVersionStatus.PUBLISHED,
      schema: `type Person { firstName: string }`,
      createdTime: 1635936707155,
      lastUpdatedTime: 1635936707155,
    });
  });
});
