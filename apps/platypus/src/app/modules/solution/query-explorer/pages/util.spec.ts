import { augmentQueryWithRequiredFields } from './util';

const normalizeString = (input: string) =>
  input.replace(/\n/gm, '').replace(/\s{1,}/gm, '');

const typeDefs = {
  types: [
    {
      name: 'WithPrimitives',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
        {
          id: 'int',
          name: 'int',
          type: {
            name: 'Int',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
        {
          id: 'timeseries',
          name: 'timeseries',
          type: {
            name: 'TimeSeries',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
        {
          id: 'directRelation',
          name: 'directRelation',
          type: {
            name: 'Person',
            list: false,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
        {
          id: 'manyRelations',
          name: 'manyRelations',
          type: {
            name: 'Person',
            list: true,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
      ],
      interfaces: [],
      directives: [],
    },
    {
      name: 'Person',
      fields: [
        {
          id: 'name',
          name: 'name',
          type: {
            name: 'String',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
        {
          id: 'linkBack',
          name: 'linkBack',
          type: {
            name: 'WithPrimitives',
            list: true,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
        },
      ],
      interfaces: [],
      directives: [],
    },
  ],
};
describe('augmentQueryWithRequiredFields', () => {
  it('simple - 1 level', async () => {
    const result = augmentQueryWithRequiredFields(
      `query MyQuery {
      listWithPrimitives {
        items {
          name
          int
          directRelation{
            externalId
          }
          manyRelations{
            items{
              externalId
            }
          }
          timeseries{
            externalId
          }
        }
      }
    }`,
      typeDefs
    );
    expect(normalizeString(result)).toEqual(
      normalizeString(`query MyQuery {
      listWithPrimitives {
        items {
          name
          int
          directRelation {
            externalId
            space
            __typename
            externalId
          }
          manyRelations {
            items {
              externalId
              space
              __typename
              externalId
            }
          }
          timeseries {
            externalId
            __typename
            externalId
          }
          space
          __typename
          externalId
        }
      }
    }`)
    );
  });
  it('complex - 2 level', async () => {
    const result = augmentQueryWithRequiredFields(
      `query MyQuery {
      listWithPrimitives {
        items {
          name
          int
          directRelation{
            externalId
          }
          manyRelations{
            items{
              externalId
              linkBack {
                items {
                  externalId
                  directRelation{
                    externalId
                  }
                }
              }
            }
          }
          timeseries{
            externalId
          }
        }
      }
    }`,
      typeDefs
    );
    expect(normalizeString(result)).toEqual(
      normalizeString(`query MyQuery {
      listWithPrimitives {
        items {
          name
          int
          directRelation {
            externalId
            space
            __typename
            externalId
          }
          manyRelations {
            items {
              externalId
              linkBack {
                items {
                  externalId
                  directRelation{
                    externalId
                    space
                    __typename
                    externalId
                  }
                  space
                  __typename
                  externalId
                }
              }
              space
              __typename
              externalId
            }
          }
          timeseries {
            externalId
            __typename
            externalId
          }
          space
          __typename
          externalId
        }
      }
    }`)
    );
  });
});
