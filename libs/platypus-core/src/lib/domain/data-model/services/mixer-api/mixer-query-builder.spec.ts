import { mixerApiInlineTypeDirectiveName } from '../../constants';
import { MixerQueryBuilder } from './mixer-query-builder';

describe('MixerApiQueryBuilderServiceTest', () => {
  const createInstance = () => {
    return new MixerQueryBuilder();
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

    const mockTypeDefs = {
      types: [
        {
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
            {
              name: 'user',
              type: {
                name: 'User',
                list: false,
                nonNull: false,
              },
              nonNull: false,
            },
          ],
        },
        {
          name: 'Post',
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
          ],
        },
        {
          name: 'User',
          directives: [
            {
              name: mixerApiInlineTypeDirectiveName,
            },
          ],
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
          ],
        },
      ],
    };

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
posts { items { externalId } }
user { name }
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
      dataModelType: mockTypeDefs.types[0],
      dataModelTypeDefs: mockTypeDefs,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });
});
