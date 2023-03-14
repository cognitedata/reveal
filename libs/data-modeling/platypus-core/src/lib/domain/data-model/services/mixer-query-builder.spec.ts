import { mixerApiInlineTypeDirectiveName } from '../constants';
import { MixerQueryBuilder, OPERATION_TYPE } from './mixer-query-builder';

const typeDefsMock = {
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
            custom: true,
          },
          nonNull: true,
        },
        {
          name: 'user',
          type: {
            name: 'User',
            list: false,
            nonNull: false,
            custom: true,
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
    {
      name: 'ComplexType',
      fields: [
        {
          name: 'c1',
          type: {
            name: 'ComplexType',
            list: true,
            nonNull: true,
            custom: true,
          },
          nonNull: true,
        },
        {
          name: 'c2',
          type: {
            name: 'ComplexType',
            list: true,
            nonNull: true,
            custom: true,
          },
          nonNull: true,
        },
        {
          name: 'post',
          type: {
            name: 'Post',
            list: true,
            nonNull: true,
            custom: true,
          },
          nonNull: true,
        },
      ],
    },
  ],
};

describe('MixerApiQueryBuilderServiceTest', () => {
  const createInstance = () => {
    return new MixerQueryBuilder();
  };

  const normalizeString = (input: string) =>
    input.replace(/\n/gm, '').replace(/\s{1,}/gm, '');
  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should create operation name for listing', () => {
    const service = createInstance();
    const operationName = service.getOperationName(
      'TestOperation',
      OPERATION_TYPE.LIST
    );
    expect(operationName).toEqual('listTestOperation');
  });

  it('should create operation name for searching', () => {
    const service = createInstance();
    const operationName = service.getOperationName(
      'TestOperation',
      OPERATION_TYPE.SEARCH
    );
    expect(operationName).toEqual('searchTestOperation');
  });

  it('should build paginated list query', () => {
    const service = createInstance();

    const limit = 100;
    const cursor = 'abcd=';

    const expected = `query listPerson ($filter: _ListPersonFilter){
      listPerson(filter: $filter, first: ${limit}, after: "${cursor}") {
        items {
          externalId
          name
posts (first: 2) { items { externalId } }
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

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should build list query with filter', () => {
    const service = createInstance();

    const limit = 100;
    const cursor = 'abcd=';
    const filter = { externalId: { eq: '123' } };

    const expected = `query listPerson ($filter: _ListPersonFilter) {
      listPerson(filter: $filter, first: ${limit}, after: "${cursor}") {
        items {
          externalId
          name
posts (first: 2) { items { externalId } }
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

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
      filter,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should build list query with sorting', () => {
    const service = createInstance();

    const limit = 100;
    const cursor = 'abcd=';
    const expected = `query listPerson($filter: _ListPersonFilter) {
      listPerson(filter: $filter, first: ${limit}, after: "${cursor}", sort: {title: ASC}) {
        items {
          externalId
          name
posts (first:2) { items { externalId } }
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

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
      sort: { fieldName: 'title', sortType: 'ASC' },
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should build search query', () => {
    const service = createInstance();

    const expected = `query searchPerson($first: Int, $query: String!, $filter:_SearchPersonFilter) {
        searchPerson(first: $first, query: $query, filter:$filter) {
          items {
            externalId
            name
            posts (first: 2){ items { externalId } }
            user { name }
          }
        }
    }`;

    const query = service.buildSearchQuery({
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should select externalId on TimeSeries fields', () => {
    const service = createInstance();

    const mockTypeDefs = {
      types: [
        {
          name: 'Person',
          fields: [
            {
              name: 'myTimeSeries',
              type: {
                name: 'TimeSeries',
                list: false,
                nonNull: false,
              },
              nonNull: false,
            },
          ],
        },
      ],
    };

    const limit = 100;
    const cursor = 'abcd=';

    const expected = `query listPerson($filter:_ListPersonFilter){
      listPerson(filter:$filter, first: ${limit}, after: "${cursor}") {
        items {
          externalId
          myTimeSeries { externalId }
        }
        pageInfo {
          startCursor
          hasPreviousPage
          hasNextPage
          endCursor
        }
      }
    }`;

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: mockTypeDefs.types[0],
      dataModelTypeDefs: mockTypeDefs,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should build complex query with Timeseries, DataPoint and DataPointValue', () => {
    const service = createInstance();

    const mockTypeDefs = {
      types: [
        {
          name: 'Demo',
          fields: [
            {
              name: 'ts',
              type: {
                name: 'TimeSeries',
                list: false,
                nonNull: true,
              },
              nonNull: true,
            },
            {
              name: 'tsList',
              type: {
                name: 'TimeSeries',
                list: true,
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

    const expected = `query listDemo($filter:_ListDemoFilter) {
      listDemo(filter:$filter, first: ${limit}, after: "${cursor}") {
        items {
          externalId
          ts { externalId }
          tsList { externalId }
        }
        pageInfo {
          startCursor
          hasPreviousPage
          hasNextPage
          endCursor
        }
      }
    }`;

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: mockTypeDefs.types[0],
      dataModelTypeDefs: mockTypeDefs,
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should be able to select just 1 field in list queries', () => {
    const service = createInstance();

    const mockTypeDefs = {
      types: [
        {
          name: 'Person',
          fields: [
            {
              name: 'myTimeSeries',
              type: {
                name: 'TimeSeries',
                list: false,
                nonNull: false,
              },
              nonNull: false,
            },
          ],
        },
      ],
    };

    const limit = 100;
    const cursor = 'abcd=';

    const expected = `query listPerson($filter:_ListPersonFilter){
      listPerson(filter:$filter, first: ${limit}, after: "${cursor}") {
        items {
          externalId
        }
        pageInfo {
          startCursor
          hasPreviousPage
          hasNextPage
          endCursor
        }
      }
    }`;

    const query = service.buildListQuery({
      cursor,
      nestedLimit: 2,
      limit,
      dataModelType: mockTypeDefs.types[0],
      dataModelTypeDefs: mockTypeDefs,
      limitFields: ['externalId'],
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });

  it('should build simple get by external id', () => {
    const service = createInstance();

    // const limit = 100;
    // const cursor = 'abcd=';
    // const filter = { externalId: { eq: '123' } };

    const expected = `query getPersonById {
      getPersonById(instance:{space:"a", externalId:"b"}) {
        items {
          externalId
          name
          posts (first: 2) { 
            items { 
              externalId
            } 
              pageInfo {
                startCursor
                hasPreviousPage
                hasNextPage
                endCursor
              }
            }
            user { name }
        }
      }
    }`;

    const query = service.buildGetByExternalIdQuery({
      nestedLimit: 2,
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
      spaceId: 'a',
      externalId: 'b',
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });
  it('should build simple get by external id with cursors and filter', () => {
    const service = createInstance();

    const cursor = 'abcd=';
    const filter = { externalId: { eq: '123' } };

    const expected = `query getPersonById ($posts: _ListPostFilter){
      getPersonById(instance:{space:"a", externalId:"b"}) {
        items {
          externalId
          name
          posts (filter:$posts, first: 2, after:"abcd=") { 
            items { 
              externalId
            } 
              pageInfo {
                startCursor
                hasPreviousPage
                hasNextPage
                endCursor
              }
            }
            user { name }
        }
      }
    }`;

    const query = service.buildGetByExternalIdQuery({
      nestedLimit: 2,
      nestedCursors: { posts: cursor },
      nestedFilters: { posts: filter },
      dataModelType: typeDefsMock.types[0],
      dataModelTypeDefs: typeDefsMock,
      spaceId: 'a',
      externalId: 'b',
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });
  it('should build complex get by external id with many cursors and filter', () => {
    const service = createInstance();

    const cursor = 'abcd=';
    const filter = { externalId: { eq: '123' } };

    const expected = `query getComplexTypeById ($c1: _ListComplexTypeFilter){
      getComplexTypeById(instance:{space:"a", externalId:"b"}) {
        items {
          externalId
          c1 (filter:$c1, first: 2) { 
            items { 
              externalId
            } 
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
          post (first: 2, after:"abcd=") { 
            items { 
              externalId
            } 
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
        }
      }
    }`;

    const query = service.buildGetByExternalIdQuery({
      nestedLimit: 2,
      nestedCursors: { post: cursor },
      nestedFilters: { c1: filter },
      dataModelType: typeDefsMock.types[3],
      dataModelTypeDefs: typeDefsMock,
      spaceId: 'a',
      externalId: 'b',
      limitFields: ['c1', 'post'],
    });

    expect(normalizeString(query)).toEqual(normalizeString(expected));
  });
});
