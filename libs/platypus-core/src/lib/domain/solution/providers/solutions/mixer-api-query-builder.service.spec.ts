import { MixerApiQueryBuilderService } from './mixer-api-query-builder.service';

describe('MixerApiQueryBuilderServiceTest', () => {
  const createInstance = () => {
    return new MixerApiQueryBuilderService();
  };

  const normalizeString = (input: string) =>
    input.replace(/\n/gm, '').replace(/\s{2,}/gm, ' ');
  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should create operation name', () => {
    const service = createInstance();
    const operationName = service.getOperationName('TestOperation');
    expect(operationName).toEqual('listTestOperation');
  });

  it('should build query', () => {
    const service = createInstance();

    const limit = 100;
    const cursor = 'abcd=';
    const mockType = {
      name: 'Person',
      fields: [
        {
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: true,
          },
          nonNull: true,
        },
        {
          name: 'posts',
          type: {
            name: 'Post',
            list: true,
            nonNull: true,
          },
          nonNull: true,
        },
      ],
    };

    const expected = `query {
      listPerson(first: ${limit}, after: "${cursor}") {
        items {
          externalId
          name
posts { externalId }
        }
        pageInfo {
          startCursor
          hasPreviousPage
          hasNextPage
          endCursor
        }
      }
    }`;

    const query = service.buildQuery({
      cursor,
      hasNextPage: true,
      limit,
      dataModelType: mockType,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });
});
