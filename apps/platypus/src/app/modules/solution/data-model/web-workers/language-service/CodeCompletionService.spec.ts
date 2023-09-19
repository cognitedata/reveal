import { Position } from 'monaco-editor';

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

describe('CodeCompletionServiceTest', () => {
  const createInstance = () => {
    return new CodeCompletionService();
  };

  const getCompletionList = ({
    currentCode,
    position,
    isFdmV3 = true,
  }: {
    currentCode: string;
    position: Partial<Position>;
    isFdmV3?: boolean;
  }) => {
    const service = createInstance();

    return service.getCompletions(
      currentCode,
      dataModel,
      position as Position,
      isFdmV3
    );
  };

  it('should suggest the type level directives', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsTypeLevelMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsTypeLevelMockCurrentCode.length - 1,
      },
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
      position: {
        lineNumber: 0,
        column: doCompletePropsFieldLevelMockCurrentCode.length - 1,
      },
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
          label: 'relation',
        }),
      ],
    });
  });

  it('should suggest a list of available parameters for the directive', () => {
    const completionList = getCompletionList({
      currentCode: doCompletePropsParametersMockCurrentCode,
      position: {
        lineNumber: 0,
        column: doCompletePropsParametersMockCurrentCode.length - 1,
      },
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
      position: {
        lineNumber: 0,
        column: doCompletePropsParametersMockCurrentCode.length - 1,
      },
      isFdmV3: false,
    });

    expect(completionList).toEqual({
      suggestions: [],
    });
  });

  it('should suggest custom types when someone types "implements" for a new type in v2', () => {
    const currentCode = 'type Actor2 implements';
    const completionList = getCompletionList({
      currentCode,
      position: {
        lineNumber: 0,
        column: currentCode.length - 1,
      },
      isFdmV3: false,
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
      position: {
        lineNumber: 0,
        column: currentCode.length - 1,
      },
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
