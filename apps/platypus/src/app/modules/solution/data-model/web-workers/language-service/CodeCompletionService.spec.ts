import { Position } from 'monaco-editor/esm/vs/editor/editor.api';

import { CodeCompletionService } from './CodeCompletionService';

const doCompletePropsFieldLevelMockCurrentCode = 'type A{    phrase: String @';

const doCompletePropsParametersMockCurrentCode =
  'type A{    phrase: String @mapping(';

const doCompletePropsTypeLevelMockCurrentCode = 'type Person @';

const dataModel = `
interface Person{
  name: String!
  age: Int
}

type Actor implements Person {
  name: String!
  age: Int
  didWinOscar: Actor
}

type Movie {
  name: String!
  description: String
  watchedIt: Boolean
}`;

const typeDefs = {
  types: [
    {
      name: 'Person',
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
          id: 'age',
          name: 'age',
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
            line: 3,
            column: 8,
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
      name: 'Actor',
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
            line: 7,
            column: 15,
          },
        },
        {
          id: 'age',
          name: 'age',
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
            line: 8,
            column: 8,
          },
        },
        {
          id: 'didWinOscar',
          name: 'didWinOscar',
          type: {
            name: 'Actor',
            list: false,
            nonNull: false,
            custom: true,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 9,
            column: 16,
          },
        },
      ],
      interfaces: ['Person'],
      directives: [],
      location: {
        line: 6,
        column: 1,
      },
    },
    {
      name: 'Movie',
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
            line: 13,
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
            line: 14,
            column: 16,
          },
        },
        {
          id: 'watchedIt',
          name: 'watchedIt',
          type: {
            name: 'Boolean',
            list: false,
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 15,
            column: 14,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 12,
        column: 1,
      },
    },
  ],
  directives: [
    {
      name: 'readonly',
      arguments: [],
    },
    {
      name: 'import',
      arguments: [
        {
          name: 'dataModel',
        },
      ],
    },
    {
      name: 'view',
      arguments: [
        {
          name: 'space',
        },
        {
          name: 'version',
        },
      ],
    },
    {
      name: 'edge',
      arguments: [],
    },
    {
      name: 'mapping',
      arguments: [
        {
          name: 'space',
        },
        {
          name: 'container',
          kind: 'type',
        },
        {
          name: 'property',
          kind: 'field',
        },
      ],
    },
    {
      name: 'default',
      arguments: [
        {
          name: 'value',
        },
      ],
    },
    {
      name: 'relation',
      arguments: [
        {
          name: 'type',
        },
        {
          name: 'name',
        },
        {
          name: 'direction',
        },
        {
          name: 'edgeSource',
        },
      ],
    },
    {
      name: 'container',
      arguments: [
        {
          name: 'constraints',
        },
        {
          name: 'indexes',
        },
      ],
    },
  ],
};

describe('CodeCompletionServiceTest', () => {
  const createInstance = () => {
    return new CodeCompletionService();
  };

  const getCompletionList = ({
    currentCode,
    graphQlCode,
    position,
    isFdmV3 = true,
  }: {
    currentCode: string;
    graphQlCode: string;
    position: Partial<Position>;
    isFdmV3?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeDefs: any;
  }) => {
    const service = createInstance();

    return service.getCompletions(
      currentCode,
      graphQlCode,
      dataModel,
      position as Position,
      isFdmV3,
      typeDefs
    );
  };

  it('should suggest the type level directives', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsTypeLevelMockCurrentCode,
      graphQlCode: doCompletePropsTypeLevelMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsTypeLevelMockCurrentCode.length - 1,
      },
      typeDefs,
    });

    expect(completionList).toEqual({
      suggestions: [
        expect.objectContaining({
          kind: 3,
          label: 'readonly',
        }),
        expect.objectContaining({
          kind: 3,
          label: 'import',
        }),
        expect.objectContaining({
          label: 'view',
          kind: 3,
        }),
        expect.objectContaining({
          kind: 3,
          label: 'edge',
        }),
        expect.objectContaining({
          kind: 3,
          label: 'container',
        }),
      ],
    });
  });

  it('should suggest the field level directives', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsFieldLevelMockCurrentCode,
      graphQlCode: doCompletePropsFieldLevelMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsFieldLevelMockCurrentCode.length - 1,
      },
      typeDefs,
    });
    expect(completionList).toEqual({
      suggestions: [
        expect.objectContaining({
          label: 'mapping',
          kind: 3,
        }),
        expect.objectContaining({
          kind: 3,
          label: 'default',
        }),
        expect.objectContaining({
          kind: 3,
          label: 'unit',
        }),
        expect.objectContaining({
          kind: 3,
          label: 'relation',
        }),
      ],
    });
  });

  it('should suggest a list of available parameters for the directive', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsParametersMockCurrentCode,
      graphQlCode: doCompletePropsParametersMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsParametersMockCurrentCode.length - 1,
      },
      typeDefs,
    });
    expect(completionList).toEqual({
      suggestions: [
        expect.objectContaining({
          label: 'space',
          kind: 6,
        }),
        expect.objectContaining({
          kind: 6,
          label: 'container',
        }),
        expect.objectContaining({
          kind: 6,
          label: 'property',
        }),
      ],
    });
  });

  it('should not suggest any directives when using fdm v2', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsParametersMockCurrentCode,
      graphQlCode: doCompletePropsParametersMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsParametersMockCurrentCode.length - 1,
      },
      isFdmV3: false,
      typeDefs,
    });

    expect(completionList).toEqual({
      suggestions: [],
    });
  });

  it('should suggest custom types when someone types "implements" for a new type in v2', () => {
    const currentCode = 'type Actor2 implements';
    const completionList = getCompletionList({
      currentCode,
      graphQlCode: currentCode,
      position: {
        lineNumber: 0,
        column: currentCode.length - 1,
      },
      isFdmV3: false,
      typeDefs,
    });

    expect(completionList).toEqual({
      suggestions: [
        expect.objectContaining({
          label: 'Person',
          kind: 8,
        }),
      ],
    });
  });

  it('should suggest custom types when someone types "implements" for a new type in v3', () => {
    const currentCode = 'type Actor2 implements';
    const completionList = getCompletionList({
      currentCode,
      graphQlCode: currentCode,
      position: {
        lineNumber: 0,
        column: currentCode.length - 1,
      },
      typeDefs,
    });

    expect(completionList).toEqual({
      suggestions: [
        expect.objectContaining({
          label: 'Person',
          kind: 8,
        }),
      ],
    });
  });
});
