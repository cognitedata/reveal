import { DOCUMENTATION_LINK } from './constants';
import { HoverProviderService } from './HoverProviderService';
import { LocationTypesMap } from './types';

const graphQlSchemaMock = `
interface Describable {
  name: String
  description: String
}

interface Assignable {
  assignedTo: String
}


interface UserName {
    """
    The name of the User.
    """
    name: String!
}


type Person implements Describable & Assignable & UserName @view {
  """
  The id of the Person.
  """
  id: ID!
  name: String!
  description: String
  assignedTo: String
  mappedField: String @mapping(container:"Test",containerPropertyIdentifier: "field")
  ownedField: Int
  posts: [Post]
}

type Post {
  id: ID!
  body: String!
  author: Person
}
`;
const dataModelMock = {
  types: [
    {
      name: 'Describable',
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
            line: 2,
            column: 9,
          },
        },
        {
          id: 'description',
          name: 'description',
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
            line: 3,
            column: 16,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 1,
        column: 1,
      },
    },
    {
      name: 'Assignable',
      fields: [
        {
          id: 'assignedTo',
          name: 'assignedTo',
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
            line: 7,
            column: 15,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 6,
        column: 1,
      },
    },
    {
      name: 'UserName',
      fields: [
        {
          id: 'name',
          name: 'name',
          description: 'The name of the User.',
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
            line: 15,
            column: 17,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 11,
        column: 1,
      },
    },
    {
      name: 'Person',
      fields: [
        {
          id: 'id',
          name: 'id',
          description: 'The id of the Person.',
          type: {
            name: 'ID',
            list: false,
            nonNull: true,
            custom: false,
          },
          nonNull: true,
          directives: [],
          arguments: [],
          location: {
            line: 23,
            column: 9,
          },
        },
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
            line: 24,
            column: 15,
          },
        },
        {
          id: 'description',
          name: 'description',
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
            line: 25,
            column: 16,
          },
        },
        {
          id: 'assignedTo',
          name: 'assignedTo',
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
            line: 26,
            column: 15,
          },
        },
        {
          id: 'mappedField',
          name: 'mappedField',
          type: {
            name: 'String',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [
            {
              name: 'mapping',
              arguments: [
                {
                  name: 'container',
                  value: {
                    kind: 'StringValue',
                    value: 'Test',
                    block: false,
                    loc: {
                      start: 410,
                      end: 416,
                    },
                  },
                },
                {
                  name: 'containerPropertyIdentifier',
                  value: {
                    kind: 'StringValue',
                    value: 'field',
                    block: false,
                    loc: {
                      start: 446,
                      end: 453,
                    },
                  },
                },
              ],
            },
          ],
          arguments: [],
          location: {
            line: 27,
            column: 85,
          },
        },
        {
          id: 'ownedField',
          name: 'ownedField',
          type: {
            name: 'Int',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 28,
            column: 15,
          },
        },
        {
          id: 'posts',
          name: 'posts',
          type: {
            name: 'Post',
            list: true,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 29,
            column: 15,
          },
        },
      ],
      interfaces: ['Describable', 'Assignable', 'UserName'],
      directives: [
        {
          name: 'view',
          arguments: [],
        },
      ],
      location: {
        line: 19,
        column: 1,
      },
    },
    {
      name: 'Post',
      fields: [
        {
          id: 'id',
          name: 'id',
          type: {
            name: 'ID',
            list: false,
            nonNull: true,
            custom: false,
          },
          nonNull: true,
          directives: [],
          arguments: [],
          location: {
            line: 33,
            column: 9,
          },
        },
        {
          id: 'body',
          name: 'body',
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
            line: 34,
            column: 15,
          },
        },
        {
          id: 'author',
          name: 'author',
          type: {
            name: 'Person',
            list: false,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 35,
            column: 11,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 32,
        column: 1,
      },
    },
  ],
};

const locationTypesMap = {
  '1': {
    name: 'Describable',
    typeName: 'Describable',
    kind: 'type',
  },
  '2': {
    name: 'name',
    typeName: 'Describable',
    kind: 'field',
  },
  '3': {
    name: 'description',
    typeName: 'Describable',
    kind: 'field',
  },
  '6': {
    name: 'Assignable',
    typeName: 'Assignable',
    kind: 'type',
  },
  '7': {
    name: 'assignedTo',
    typeName: 'Assignable',
    kind: 'field',
  },
  '11': {
    name: 'UserName',
    typeName: 'UserName',
    kind: 'type',
  },
  '15': {
    name: 'name',
    typeName: 'UserName',
    kind: 'field',
  },
  '19': {
    name: 'Person',
    typeName: 'Person',
    kind: 'type',
  },
  '23': {
    name: 'id',
    typeName: 'Person',
    kind: 'field',
  },
  '24': {
    name: 'name',
    typeName: 'Person',
    kind: 'field',
  },
  '25': {
    name: 'description',
    typeName: 'Person',
    kind: 'field',
  },
  '26': {
    name: 'assignedTo',
    typeName: 'Person',
    kind: 'field',
  },
  '27': {
    name: 'mappedField',
    typeName: 'Person',
    kind: 'field',
  },
  '28': {
    name: 'ownedField',
    typeName: 'Person',
    kind: 'field',
  },
  '29': {
    name: 'posts',
    typeName: 'Person',
    kind: 'field',
  },
  '32': {
    name: 'Post',
    typeName: 'Post',
    kind: 'type',
  },
  '33': {
    name: 'id',
    typeName: 'Post',
    kind: 'field',
  },
  '34': {
    name: 'body',
    typeName: 'Post',
    kind: 'field',
  },
  '35': {
    name: 'author',
    typeName: 'Post',
    kind: 'field',
  },
} as LocationTypesMap;
describe('HoverProviderService Test', () => {
  const hoverProvider = new HoverProviderService();
  it('provides primitive field information', () => {
    const actual = hoverProvider.getHoverInformation(
      dataModelMock,
      locationTypesMap,
      { lineNumber: 24, column: 15 }
    );

    expect(actual.content).toEqual(
      '```graphql\n(field) Person.name: String - Not nullable\n```'
    );
  });

  it('provides primitive field information with description', () => {
    const actual = hoverProvider.getHoverInformation(
      dataModelMock,
      locationTypesMap,
      { lineNumber: 23, column: 15 }
    );

    expect(actual.content).toEqual(
      '```graphql\n(field) Person.id: ID - Not nullable\n```\nThe id of the Person.'
    );
  });

  it('provides custom field information', () => {
    const actual = hoverProvider.getHoverInformation(
      dataModelMock,
      locationTypesMap,
      { lineNumber: 35, column: 15 }
    );

    const expected = `
    type Person implements Describable & Assignable & UserName @view {
      "The id of the Person."
      id: ID!
      name: String!
      description: String
      assignedTo: String
      mappedField: String @mapping(container: "Test", containerPropertyIdentifier: "field")
      ownedField: Int
      posts: [Post]
    }`;

    expect(actual.content.replace(/[\s\n]/gim, '')).toEqual(
      (
        '```graphql\n' +
        expected +
        '```\n\nDocumentation:\n\n' +
        DOCUMENTATION_LINK
      ).replace(/[\s\n]/gim, '')
    );
  });

  it('provides type information', () => {
    const actual = hoverProvider.getHoverInformation(
      dataModelMock,
      locationTypesMap,
      { lineNumber: 19, column: 15 }
    );

    const expected = `### View and Container mappings
    | View | Container|
    | --- | --- |
    |id |**Person.id**: ID, not nullable|
    |name |**UserName.name**: String, not nullable|
    |description |**Describable.description**: String|
    |assignedTo |**Assignable.assignedTo**: String|
    |mappedField |**Test.field**: String|
    |ownedField |**Person.ownedField**: Int|
    |posts |**Person.posts**: [Post]|
    | | |
    
    Documentation:
    ${DOCUMENTATION_LINK}`;

    expect(actual.content.replace(/[\s\n]/gim, '')).toEqual(
      expected.replace(/[\s\n]/gim, '')
    );
  });
});
