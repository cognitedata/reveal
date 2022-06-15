import { DataModelVersionStatus } from '../../types';
import { SolutionTemplatesFacadeService } from './solution-templates-facade.service';

describe('SolutionsTemplatesFacadeServiceTest', () => {
  const templateGroupMock = {
    externalId: 'Template group test',
    description: 'Test template group',
    owners: ['test-user@cognite.com'],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const expectedMock = {
    createdTime: 1635936707155,
    description: 'Test template group',
    id: 'Template group test',
    name: 'Template group test',
    owners: ['test-user@cognite.com'],
    updatedTime: 1635936707155,
  };

  const templateSchemaMock = {
    version: 1,
    schema: `type Person { firstName: string }`,
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const templatesApiServiceMock = {
    listTemplateGroups: jest.fn().mockImplementation(() => {
      return Promise.resolve([templateGroupMock]);
    }),
    createTemplateGroup: jest.fn().mockImplementation(() => {
      return Promise.resolve(templateGroupMock);
    }),
    deleteTemplateGroup: jest.fn(),
    listSchemaVersions: jest.fn().mockImplementation(() => {
      return Promise.resolve([templateSchemaMock]);
    }),
    publishSchema: jest.fn().mockImplementation(() => {
      return Promise.resolve(templateSchemaMock);
    }),
  } as any;

  const createInstance = () => {
    return new SolutionTemplatesFacadeService(templatesApiServiceMock);
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should load template groups as solutions', async () => {
    const service = createInstance();
    const solutions = await service.list();
    expect(templatesApiServiceMock.listTemplateGroups).toBeCalled();

    expect(solutions).toEqual([expectedMock]);
  });

  it('should create template group as solution', async () => {
    const service = createInstance();
    const solutions = await service.create({
      name: templateGroupMock.externalId,
      description: templateGroupMock.description,
      owner: 'test-user@cognite.com',
    });
    expect(templatesApiServiceMock.createTemplateGroup).toBeCalled();

    expect(solutions).toEqual(expectedMock);
  });

  it('should delete template group', async () => {
    const service = createInstance();
    await service.delete({
      id: templateGroupMock.externalId,
    });
    expect(templatesApiServiceMock.deleteTemplateGroup).toBeCalled();
  });

  it('should list template schema versions', async () => {
    const service = createInstance();
    await service.listVersions({
      dataModelId: templateGroupMock.externalId,
      version: '1',
    });
    expect(templatesApiServiceMock.listSchemaVersions).toBeCalled();
  });

  it('should create schema', async () => {
    const service = createInstance();
    await service.publishVersion({
      externalId: templateGroupMock.externalId,
      version: '1',
      schema: templateSchemaMock.schema,
      status: DataModelVersionStatus.PUBLISHED,
      createdTime: 0,
      lastUpdatedTime: 0,
    });
    expect(templatesApiServiceMock.publishSchema).toBeCalled();
  });
});
