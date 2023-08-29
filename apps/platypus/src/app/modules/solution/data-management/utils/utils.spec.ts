import { DataModelTypeDefsType } from '@fusion/data-modeling';

import { isEdgeType } from './utils';

const mockTypeDefs: DataModelTypeDefsType[] = [
  {
    name: 'Cdf3dModel',
    fields: [
      {
        id: 'name',
        name: 'name',
        type: {
          name: 'String',
          list: false,
          nonNull: true,
          custom: false,
        },
        nonNull: true,
        directives: [],
        arguments: [],
        location: {
          line: 2,
          column: 15,
        },
      },
      {
        id: 'entities',
        name: 'entities',
        type: {
          name: 'Cdf3dEntity',
          list: true,
          nonNull: false,
          custom: true,
        },
        nonNull: false,
        directives: [
          {
            name: 'relation',
            arguments: [
              {
                name: 'type',
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'space',
                        loc: {
                          start: 129,
                          end: 134,
                        },
                      },
                      value: {
                        kind: 'StringValue',
                        value: 'cdf_3d_schema',
                        block: false,
                        loc: {
                          start: 137,
                          end: 152,
                        },
                      },
                      loc: {
                        start: 129,
                        end: 152,
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'externalId',
                        loc: {
                          start: 154,
                          end: 164,
                        },
                      },
                      value: {
                        kind: 'StringValue',
                        value: 'cdf3dEntityConnection',
                        block: false,
                        loc: {
                          start: 167,
                          end: 190,
                        },
                      },
                      loc: {
                        start: 154,
                        end: 190,
                      },
                    },
                  ],
                  loc: {
                    start: 128,
                    end: 191,
                  },
                },
              },
              {
                name: 'direction',
                value: {
                  kind: 'EnumValue',
                  value: 'INWARDS',
                  loc: {
                    start: 204,
                    end: 211,
                  },
                },
              },
              {
                name: 'edgeSource',
                value: {
                  kind: 'StringValue',
                  value: 'Cdf3dConnectionProperties',
                  block: false,
                  loc: {
                    start: 225,
                    end: 252,
                  },
                },
              },
            ],
          },
        ],
        arguments: [],
        location: {
          line: 3,
          column: 167,
        },
      },
    ],
    interfaces: [],
    directives: [
      {
        name: 'import',
        arguments: [],
      },
      {
        name: 'view',
        arguments: [
          {
            name: 'space',
            value: {
              kind: 'StringValue',
              value: 'cdf_3d_schema',
              block: false,
              loc: {
                start: 37,
                end: 52,
              },
            },
          },
          {
            name: 'version',
            value: {
              kind: 'StringValue',
              value: '1',
              block: false,
              loc: {
                start: 63,
                end: 66,
              },
            },
          },
        ],
      },
    ],
    location: {
      line: 1,
      column: 1,
    },
    version: '1',
  },
  {
    name: 'Cdf3dEntity',
    fields: [
      {
        id: 'inModel3d',
        name: 'inModel3d',
        type: {
          name: 'Cdf3dModel',
          list: true,
          nonNull: false,
          custom: true,
        },
        nonNull: false,
        directives: [
          {
            name: 'relation',
            arguments: [
              {
                name: 'type',
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'space',
                        loc: {
                          start: 376,
                          end: 381,
                        },
                      },
                      value: {
                        kind: 'StringValue',
                        value: 'cdf_3d_schema',
                        block: false,
                        loc: {
                          start: 384,
                          end: 399,
                        },
                      },
                      loc: {
                        start: 376,
                        end: 399,
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'externalId',
                        loc: {
                          start: 401,
                          end: 411,
                        },
                      },
                      value: {
                        kind: 'StringValue',
                        value: 'cdf3dEntityConnection',
                        block: false,
                        loc: {
                          start: 414,
                          end: 437,
                        },
                      },
                      loc: {
                        start: 401,
                        end: 437,
                      },
                    },
                  ],
                  loc: {
                    start: 375,
                    end: 438,
                  },
                },
              },
              {
                name: 'edgeSource',
                value: {
                  kind: 'StringValue',
                  value: 'Cdf3dConnectionProperties',
                  block: false,
                  loc: {
                    start: 452,
                    end: 479,
                  },
                },
              },
            ],
          },
        ],
        arguments: [],
        location: {
          line: 7,
          column: 147,
        },
      },
    ],
    interfaces: [],
    directives: [
      {
        name: 'import',
        arguments: [],
      },
      {
        name: 'view',
        arguments: [
          {
            name: 'space',
            value: {
              kind: 'StringValue',
              value: 'cdf_3d_schema',
              block: false,
              loc: {
                start: 300,
                end: 315,
              },
            },
          },
          {
            name: 'version',
            value: {
              kind: 'StringValue',
              value: '1',
              block: false,
              loc: {
                start: 326,
                end: 329,
              },
            },
          },
        ],
      },
    ],
    location: {
      line: 6,
      column: 1,
    },
    version: '1',
  },
  {
    name: 'Cdf3dConnectionProperties',
    fields: [
      {
        id: 'revisionId',
        name: 'revisionId',
        type: {
          name: 'Int64',
          list: false,
          nonNull: true,
          custom: false,
        },
        nonNull: true,
        directives: [],
        arguments: [],
        location: {
          line: 11,
          column: 20,
        },
      },
      {
        id: 'revisionNodeId',
        name: 'revisionNodeId',
        type: {
          name: 'Int64',
          list: false,
          nonNull: true,
          custom: false,
        },
        nonNull: true,
        directives: [],
        arguments: [],
        location: {
          line: 12,
          column: 24,
        },
      },
    ],
    interfaces: [],
    directives: [
      {
        name: 'import',
        arguments: [],
      },
      {
        name: 'view',
        arguments: [
          {
            name: 'space',
            value: {
              kind: 'StringValue',
              value: 'cdf_3d_schema',
              block: false,
              loc: {
                start: 536,
                end: 551,
              },
            },
          },
          {
            name: 'version',
            value: {
              kind: 'StringValue',
              value: '1',
              block: false,
              loc: {
                start: 562,
                end: 565,
              },
            },
          },
        ],
      },
      {
        name: 'edge',
        arguments: [],
      },
      {
        name: 'container',
        arguments: [
          {
            name: 'constraints',
            value: {
              kind: 'ListValue',
              values: [
                {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'identifier',
                        loc: {
                          start: 599,
                          end: 609,
                        },
                      },
                      value: {
                        kind: 'StringValue',
                        value: 'uniqueNodeRevisionConstraint',
                        block: false,
                        loc: {
                          start: 612,
                          end: 642,
                        },
                      },
                      loc: {
                        start: 599,
                        end: 642,
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'constraintType',
                        loc: {
                          start: 644,
                          end: 658,
                        },
                      },
                      value: {
                        kind: 'EnumValue',
                        value: 'UNIQUENESS',
                        loc: {
                          start: 661,
                          end: 671,
                        },
                      },
                      loc: {
                        start: 644,
                        end: 671,
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: {
                        kind: 'Name',
                        value: 'fields',
                        loc: {
                          start: 673,
                          end: 679,
                        },
                      },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'StringValue',
                            value: 'revisionId',
                            block: false,
                            loc: {
                              start: 683,
                              end: 695,
                            },
                          },
                          {
                            kind: 'StringValue',
                            value: 'revisionNodeId',
                            block: false,
                            loc: {
                              start: 697,
                              end: 713,
                            },
                          },
                        ],
                        loc: {
                          start: 682,
                          end: 714,
                        },
                      },
                      loc: {
                        start: 673,
                        end: 714,
                      },
                    },
                  ],
                  loc: {
                    start: 598,
                    end: 715,
                  },
                },
              ],
              loc: {
                start: 597,
                end: 716,
              },
            },
          },
        ],
      },
    ],
    location: {
      line: 10,
      column: 1,
    },
    version: '1',
  },
  {
    name: 'Equipment',
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
        location: {
          line: 16,
          column: 11,
        },
      },
      {
        id: 'inModel3d',
        name: 'inModel3d',
        type: {
          name: 'Cdf3dModel',
          list: true,
          nonNull: false,
          custom: true,
        },
        nonNull: false,
        directives: [],
        arguments: [],
        location: {
          line: 17,
          column: 27,
        },
      },
    ],
    interfaces: ['Cdf3dEntity'],
    directives: [],
    location: {
      line: 15,
      column: 1,
    },
    version: 'bc56966175b7cf',
  },
];

describe('isEdgeType', () => {
  it('Should return true if type is edge', () => {
    const result = mockTypeDefs.filter((type) => {
      return !isEdgeType(type);
    });

    expect(result).toHaveLength(3);
  });

  it('Should return false if type is not edge', () => {
    const result = mockTypeDefs.filter((type) => {
      return isEdgeType(type);
    });
    expect(result).toHaveLength(1);
  });
});
