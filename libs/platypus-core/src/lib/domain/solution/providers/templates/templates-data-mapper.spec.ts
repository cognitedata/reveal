import { TemplatesDataMapper } from './templates-data-mapper';

describe('TemplatesDataMapperTest', () => {
  const createInstance = () => {
    return new TemplatesDataMapper();
  };

  const templatesMock = {
    externalId: 'Template group test',
    description: 'Test template group',
    owners: [],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should deserialize templates object into solution', () => {
    const service = createInstance();
    expect(service.deserialize(templatesMock)).toEqual({
      createdTime: 1635936707155,
      description: 'Test template group',
      id: 'Template group test',
      name: 'Template group test',
      owners: [],
      updatedTime: 1635936707155,
    });
  });
});
