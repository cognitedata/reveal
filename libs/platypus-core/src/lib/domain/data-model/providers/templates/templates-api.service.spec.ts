import { PlatypusError } from '@platypus-core/boundaries/types';
import { TemplatesApiService } from './templates-api.service';

describe('TemplatesApiServiceTest', () => {
  const templateGroupMock = {
    externalId: 'Template group test',
    description: 'Test template group',
    owners: ['test-user@cognite.com'],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const templateSchemaMock = {
    version: 1,
    schema: `type Person { firstName: string }`,
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const listVersionsMock = jest.fn().mockImplementation(() => {
    return Promise.resolve({ items: [templateSchemaMock] });
  });
  const upsertVersionMock = jest.fn().mockImplementation(() => {
    return Promise.resolve(templateSchemaMock);
  });

  const cdfMock = {
    templates: {
      groups: {
        list: jest.fn().mockImplementation(() => {
          return Promise.resolve({ items: [templateGroupMock] });
        }),
        retrieve: jest.fn().mockImplementation(() => {
          return Promise.resolve([templateGroupMock]);
        }),
        create: jest.fn().mockImplementation(() => {
          return Promise.resolve([templateGroupMock]);
        }),
        delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
      },
      group: jest.fn().mockImplementation(() => {
        return {
          versions: {
            list: listVersionsMock,
            upsert: upsertVersionMock,
          },
        };
      }),
    },
  } as any;

  const createInstance = () => {
    return new TemplatesApiService(cdfMock);
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should load template groups as solutions', async () => {
    const service = createInstance();
    const solutions = await service.listTemplateGroups();
    expect(cdfMock.templates.groups.list).toBeCalled();

    expect(solutions).toEqual([templateGroupMock]);
  });

  it('should create template group as solution', async () => {
    const service = createInstance();
    const solutions = await service.createTemplateGroup({
      name: templateGroupMock.externalId,
      description: templateGroupMock.description,
      owner: 'test-user@cognite.com',
    });
    expect(cdfMock.templates.groups.create).toBeCalled();

    expect(solutions).toEqual(templateGroupMock);
  });

  it('should delete template group', async () => {
    const service = createInstance();
    await service.deleteTemplateGroup({
      id: templateGroupMock.externalId,
    });
    expect(cdfMock.templates.groups.delete).toBeCalled();
  });

  it('should list all template group versions', async () => {
    const service = createInstance();
    const versions = await service.listSchemaVersions({
      dataModelId: '123',
      version: '1',
    });
    expect(listVersionsMock).toBeCalled();
    expect(versions).toEqual([templateSchemaMock]);
  });

  it('should load template group as a solution', async () => {
    const service = createInstance();
    const solution = await service.fetchTemplateGroup({
      dataModelId: templateGroupMock.externalId,
    });
    expect(cdfMock.templates.groups.list).toBeCalled();
    expect(solution).toEqual(templateGroupMock);
  });

  it('should create new template schema version', async () => {
    const service = createInstance();
    const version = await service.publishSchema({
      schema: templateSchemaMock.schema,
      externalId: '1234',
      version: '1',
    });
    expect(upsertVersionMock).toBeCalledWith({
      conflictMode: 'Update',
      schema: templateSchemaMock.schema,
      version: 1,
    });
    expect(version).toEqual(templateSchemaMock);
  });

  it('should update template schema version', async () => {
    const service = createInstance();
    const version = await service.updateSchema({
      schema: templateSchemaMock.schema,
      externalId: '1234',
      version: '1',
    });
    expect(upsertVersionMock).toBeCalledWith({
      conflictMode: 'Patch',
      schema: templateSchemaMock.schema,
      version: 1,
    });
    expect(version).toEqual(templateSchemaMock);
  });

  it('should handle case if there is a breaking change', async () => {
    const service = createInstance();
    upsertVersionMock.mockImplementation(() => {
      return Promise.reject({
        message: 'breaking changes found',
        errorMessage: 'breaking changes found on line...',
        status: 400,
      });
    });

    expect(
      service.updateSchema({
        schema: templateSchemaMock.schema,
        externalId: '1234',
        version: '1',
      })
    ).rejects.toBeInstanceOf(PlatypusError);
  });
});
