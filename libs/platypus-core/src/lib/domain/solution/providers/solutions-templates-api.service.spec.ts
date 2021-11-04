import { SolutionsTemplatesApiService } from './solutions-templates-api.service';

describe('SolutionsTemplatesApiServiceTest', () => {
  const templatesMock = {
    externalId: 'Template group test',
    description: 'Test template group',
    owners: [],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const cdfMock = {
    templates: {
      groups: {
        list: jest.fn().mockImplementation(() => {
          return Promise.resolve({ items: [templatesMock] });
        }),
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

    expect(solutions).toEqual([
      {
        createdTime: 1635936707155,
        description: 'Test template group',
        id: 'Template group test',
        name: 'Template group test',
        owners: [],
        updatedTime: 1635936707155,
      },
    ]);
  });
});
