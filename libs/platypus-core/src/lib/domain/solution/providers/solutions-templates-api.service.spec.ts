import { SolutionsTemplatesApiService } from './solutions-templates-api.service';

describe('SolutionsTemplatesApiServiceTest', () => {
  const templatesMock = {
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

  const cdfMock = {
    templates: {
      groups: {
        list: jest.fn().mockImplementation(() => {
          return Promise.resolve({ items: [templatesMock] });
        }),
        create: jest.fn().mockImplementation(() => {
          return Promise.resolve([templatesMock]);
        }),
        delete: jest.fn(),
      },
    },
  } as any;
  const createInstance = () => {
    return new SolutionsTemplatesApiService(cdfMock);
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should load template groups as solutions', async () => {
    const service = createInstance();
    const solutions = await service.list();
    expect(cdfMock.templates.groups.list).toBeCalled();

    expect(solutions).toEqual([expectedMock]);
  });

  it('should create template group as solution', async () => {
    const service = createInstance();
    const solutions = await service.create({
      name: templatesMock.externalId,
      description: templatesMock.description,
      owner: 'test-user@cognite.com',
    });
    expect(cdfMock.templates.groups.create).toBeCalled();

    expect(solutions).toEqual(expectedMock);
  });

  it('should delete template group', async () => {
    const service = createInstance();
    await service.delete({
      id: templatesMock.externalId,
    });
    expect(cdfMock.templates.groups.create).toBeCalled();
  });
});
