import {
  BuiltInType,
  DataModelTypeDefs,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';
import { CodeCompletionService } from './CodeCompletionService';

const dataModelTypeDefs: DataModelTypeDefs = {
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
            nonNull: false,
            custom: false,
          },
          nonNull: false,
          directives: [],
          arguments: [],
          location: {
            line: 57,
            column: 11,
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
            line: 58,
            column: 10,
          },
        },
        {
          id: 'newField',
          name: 'newField',
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
            line: 59,
            column: 15,
          },
        },
        {
          id: 'fName',
          name: 'fName',
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
            line: 60,
            column: 12,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 56,
        column: 1,
      },
    },
    {
      name: 'Name',
      fields: [
        {
          id: 'last',
          name: 'last',
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
            line: 64,
            column: 14,
          },
        },
        {
          id: 'first',
          name: 'first',
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
            line: 65,
            column: 18,
          },
        },
        {
          id: 'middle',
          name: 'middle',
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
            line: 66,
            column: 13,
          },
        },
        {
          id: 'title',
          name: 'title',
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
                  name: 'space',
                  value: {
                    kind: 'StringValue',
                    value: 'demo',
                    block: false,
                    loc: {
                      start: 1326,
                      end: 1332,
                    },
                  },
                },
                {
                  name: 'container',
                  value: {
                    kind: 'StringValue',
                    value: 'Person',
                    block: false,
                    loc: {
                      start: 1345,
                      end: 1353,
                    },
                  },
                },
                {
                  name: 'property',
                  value: {
                    kind: 'StringValue',
                    value: 'title',
                    block: false,
                    loc: {
                      start: 1364,
                      end: 1371,
                    },
                  },
                },
              ],
            },
          ],
          arguments: [],
          location: {
            line: 67,
            column: 79,
          },
        },
      ],
      interfaces: ['FullName'],
      directives: [],
      location: {
        line: 63,
        column: 1,
      },
    },
    {
      name: 'FullName',
      fields: [
        {
          id: 'first',
          name: 'first',
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
            line: 71,
            column: 18,
          },
        },
        {
          id: 'last',
          name: 'last',
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
            line: 72,
            column: 17,
          },
        },
        {
          id: 'middle',
          name: 'middle',
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
            line: 73,
            column: 13,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 70,
        column: 1,
      },
    },
    {
      name: 'Greeting',
      fields: [
        {
          id: 'phrase',
          name: 'phrase',
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
            line: 77,
            column: 13,
          },
        },
      ],
      interfaces: [],
      directives: [],
      location: {
        line: 76,
        column: 1,
      },
    },
  ],
  directives: [
    {
      name: 'view',
      arguments: [
        {
          name: 'space',
          value: undefined,
        },
        {
          name: 'name',
          kind: 'type',
          value: undefined,
        },
        {
          name: 'version',
          value: undefined,
        },
      ],
    },
    {
      name: 'mapping',
      arguments: [
        {
          name: 'space',
          value: undefined,
        },
        {
          name: 'container',
          kind: 'type',
          value: undefined,
        },
        {
          name: 'property',
          kind: 'field',
          value: undefined,
        },
      ],
    },
    {
      name: 'relation',
      arguments: [
        {
          name: 'type',
          value: undefined,
        },
        {
          name: 'name',
          value: undefined,
        },
        {
          name: 'direction',
          value: undefined,
        },
      ],
    },
    {
      name: 'container',
      arguments: [
        {
          name: 'constraints',
          value: undefined,
        },
        {
          name: 'indexes',
          value: undefined,
        },
      ],
    },
  ],
};

const doCompletePropsFieldLevelMock = {
  textUntilPosition: '    phrase: String @',
  builtInTypes: mixerApiBuiltInTypes,
  useExtendedSdl: true,
  dataModelTypeDefs,
};

const doCompletePropsParametersMock = {
  textUntilPosition: '    phrase: String @mapping(',
  builtInTypes: mixerApiBuiltInTypes,
  useExtendedSdl: true,
  dataModelTypeDefs,
};

const doCompletePropsParameterValueMock = {
  textUntilPosition: '    phrase: String @mapping(container:"Name",property:"',
  builtInTypes: mixerApiBuiltInTypes,
  useExtendedSdl: true,
  dataModelTypeDefs,
};

const doCompletePropsTypeLevelMock = {
  textUntilPosition: 'type Person @',
  builtInTypes: mixerApiBuiltInTypes,
  useExtendedSdl: true,
  dataModelTypeDefs,
};

describe('CodeCompletionServiceTest', () => {
  const createInstance = () => {
    return new CodeCompletionService();
  };

  const getCompletionList = ({
    builtInTypes,
    textUntilPosition,
    useExtendedSdl,
    dataModelTypeDefs,
  }: {
    textUntilPosition: string;
    builtInTypes: BuiltInType[];
    useExtendedSdl: boolean;
    dataModelTypeDefs: DataModelTypeDefs;
  }) => {
    const service = createInstance();

    return service.getCompletions(
      textUntilPosition,
      builtInTypes as BuiltInType[],
      useExtendedSdl,
      dataModelTypeDefs
    );
  };

  it('should suggest the type level directives', () => {
    const completionList = getCompletionList(doCompletePropsTypeLevelMock);

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'view',
          kind: 7,
          insertText: 'view',
          insertTextRules: 4,
        },
        {
          insertText: 'container',
          insertTextRules: 4,
          kind: 7,
          label: 'container',
        },
      ],
    });
  });

  it('should suggest the field level directives', () => {
    const completionList = getCompletionList(doCompletePropsFieldLevelMock);

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'mapping',
          kind: 7,
          insertText: 'mapping',
          insertTextRules: 4,
        },
        {
          insertText: 'relation',
          insertTextRules: 4,
          kind: 7,
          label: 'relation',
        },
      ],
    });
  });

  it('should suggest a list of available parameters for the directive', () => {
    const completionList = getCompletionList(doCompletePropsParametersMock);

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'space',
          kind: 7,
          insertText: 'space:',
          insertTextRules: 4,
        },
        {
          label: 'container',
          kind: 7,
          insertText: 'container:',
          insertTextRules: 4,
        },
        {
          label: 'property',
          kind: 7,
          insertText: 'property:',
          insertTextRules: 4,
        },
      ],
    });
  });

  it('should suggest the corresponding fields when the container is provided by the user', () => {
    const completionList = getCompletionList(doCompletePropsParameterValueMock);

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'last',
          kind: 7,
          insertText: 'last',
          insertTextRules: 4,
        },
        {
          label: 'first',
          kind: 7,
          insertText: 'first',
          insertTextRules: 4,
        },
        {
          label: 'middle',
          kind: 7,
          insertText: 'middle',
          insertTextRules: 4,
        },
        {
          label: 'title',
          kind: 7,
          insertText: 'title',
          insertTextRules: 4,
        },
      ],
    });
  });

  it('should not suggest any directives when using fdm v2', () => {
    const completionList = getCompletionList({
      ...doCompletePropsTypeLevelMock,
      useExtendedSdl: false,
    });

    expect(completionList).toEqual({
      suggestions: [],
    });
  });

  it('should suggest custom types when someone types "implements" for a new type in v2', () => {
    const completionList = getCompletionList({
      ...doCompletePropsTypeLevelMock,
      useExtendedSdl: false,
      textUntilPosition: 'type Hello implements ',
    });

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'Person',
          kind: 5,
          insertText: 'Person',
          insertTextRules: 4,
        },
        {
          label: 'Name',
          kind: 5,
          insertText: 'Name',
          insertTextRules: 4,
        },
        {
          label: 'FullName',
          kind: 5,
          insertText: 'FullName',
          insertTextRules: 4,
        },
        {
          label: 'Greeting',
          kind: 5,
          insertText: 'Greeting',
          insertTextRules: 4,
        },
      ],
    });
  });

  it('should suggest custom types when someone types "implements" for a new type in v3', () => {
    const completionList = getCompletionList({
      ...doCompletePropsTypeLevelMock,
      textUntilPosition: 'type Hello implements ',
    });

    expect(completionList).toEqual({
      suggestions: [
        {
          label: 'Person',
          kind: 5,
          insertText: 'Person',
          insertTextRules: 4,
        },
        {
          label: 'Name',
          kind: 5,
          insertText: 'Name',
          insertTextRules: 4,
        },
        {
          label: 'FullName',
          kind: 5,
          insertText: 'FullName',
          insertTextRules: 4,
        },
        {
          label: 'Greeting',
          kind: 5,
          insertText: 'Greeting',
          insertTextRules: 4,
        },
      ],
    });
  });
});
