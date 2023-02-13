import {
  ArgumentNodeProps,
  BuiltInType,
  DataModelTypeDefs,
} from '@platypus/platypus-core';
import {
  CompletionItem,
  CompletionList,
  CompletionItemKind,
  CompletionItemInsertTextRule,
} from './types';

/**
 * TS class for handling code completion and suggestions.
 * Used in the web worker
 */
export class CodeCompletionService {
  private iconsMap = {
    DIRECTIVE: CompletionItemKind.Interface,
    OBJECT: CompletionItemKind.Class,
    SCALAR: CompletionItemKind.Text,
  } as {
    [key: string]: CompletionItemKind;
  };

  private dataModelTypeDefs: DataModelTypeDefs | null = null;

  getCompletions(
    textUntilPosition: string,
    builtInTypes: BuiltInType[],
    useExtendedSdl: boolean,
    dataModelTypeDefs: DataModelTypeDefs | null
  ): CompletionList {
    this.dataModelTypeDefs = dataModelTypeDefs;

    try {
      const customTypes = [] as BuiltInType[];
      const objectAndInterfaceDirectives = builtInTypes.filter(
        (type) => !type.fieldDirective
      );

      // extract all current custom types from code editor
      dataModelTypeDefs?.types.forEach((type) =>
        customTypes.push({
          name: type.name,
          type: 'OBJECT',
        })
      );

      // suggest existing views in the editor when the user
      // tries to implement an interface.
      if (
        textUntilPosition
          .trim()
          .match(/type\s{1,}[A-Z][a-zA-Z0-9_]+\s{1,}implements/)
      ) {
        return {
          suggestions: this.getCodeCompletionItems(
            textUntilPosition,
            customTypes,
            'OBJECT'
          ),
        };
      }

      if (useExtendedSdl) {
        // graphql sdl v3 code completion
        // capture type/interface level directive
        if (
          textUntilPosition
            .trim()
            .match(/(type|interface)\s{1,}[A-Z][a-zA-Z0-9_]+\s*/)
        ) {
          // handle case when user request code completion
          // for type. In this case return directives from built in types
          if (textUntilPosition.trim().match(/\s*@$/)) {
            return {
              suggestions: this.getCodeCompletionItems(
                textUntilPosition,
                objectAndInterfaceDirectives,
                'DIRECTIVE'
              ),
            } as CompletionList;
          }

          // suggest possible directives for the type or interface
          if (
            textUntilPosition
              .trim()
              .match(/(interface|type)\s{1,}[A-Z][a-zA-Z0-9_]+\s{1,}@[a-z]+[(]/)
          ) {
            const directiveName = this.getDirectiveName(textUntilPosition);
            const selectedTypeDirective = objectAndInterfaceDirectives.filter(
              (type) => directiveName === type.name
            );
            const typeKindDirectiveArgument = this.getDirectiveArgumentByKind(
              textUntilPosition,
              'type'
            );
            const currentDirectiveArgument =
              this.getCurrentDirectiveArgument(textUntilPosition);

            // suggest possible custom types for the directive parameter
            if (typeKindDirectiveArgument?.name === currentDirectiveArgument) {
              if (typeKindDirectiveArgument) {
                return {
                  suggestions: this.getCodeCompletionItems(
                    textUntilPosition,
                    customTypes,
                    'OBJECT'
                  ),
                };
              }

              return { suggestions: [] } as CompletionList;
            }

            // suggest possible arguments for the directive
            if (
              textUntilPosition.trim().match(/"\s*,$/) ||
              textUntilPosition.trim().match(/\s*\($/)
            ) {
              return {
                suggestions: this.getCodeCompletionItems(
                  textUntilPosition,
                  selectedTypeDirective,
                  'DIRECTIVE'
                ),
              } as CompletionList;
            }

            return { suggestions: [] } as CompletionList;
          }
        }

        // handle code completion for directives at the field level definitions
        if (
          textUntilPosition.trim().match(/[a-zA-Z0-9_]+:\s*[a-zA-Z!]+\s{1,}/)
        ) {
          const fieldDefinitionDirectives = builtInTypes.filter(
            (type) => type.fieldDirective
          );

          if (textUntilPosition.trim().match(/\s*@$/)) {
            return {
              suggestions: this.getCodeCompletionItems(
                textUntilPosition,
                fieldDefinitionDirectives,
                'DIRECTIVE'
              ),
            } as CompletionList;
          }

          const directiveName = this.getDirectiveName(textUntilPosition);

          const selectedFieldDirective = fieldDefinitionDirectives.filter(
            (type) => directiveName === type.name
          );

          if (textUntilPosition.trim().match(/:\s*"$/)) {
            const typeKindDirectiveArgument = this.getDirectiveArgumentByKind(
              textUntilPosition,
              'type'
            );

            const fieldKindDirectiveArgument = this.getDirectiveArgumentByKind(
              textUntilPosition,
              'field'
            );

            const currentDirectiveArgument =
              this.getCurrentDirectiveArgument(textUntilPosition);

            if (fieldKindDirectiveArgument?.name === currentDirectiveArgument) {
              return {
                suggestions: this.getCompletionItemsFromFieldTypes(
                  this.getTypeNameFromLine(
                    textUntilPosition,
                    typeKindDirectiveArgument?.name || ''
                  ),
                  dataModelTypeDefs,
                  this.iconsMap['DIRECTIVE']
                ) as CompletionItem[],
              } as CompletionList;
            }

            if (typeKindDirectiveArgument?.name === currentDirectiveArgument) {
              return {
                suggestions: this.getCodeCompletionItems(
                  textUntilPosition,
                  customTypes,
                  'OBJECT'
                ),
              };
            }
          }

          if (
            textUntilPosition.trim().match(/"\s*,$/) ||
            textUntilPosition.trim().match(/\s*\($/)
          ) {
            return {
              suggestions: this.getCodeCompletionItems(
                textUntilPosition,
                selectedFieldDirective,
                'DIRECTIVE'
              ),
            } as CompletionList;
          }

          return { suggestions: [] } as CompletionList;
        }
      }

      // handle case when user request code completion
      // for field. In this case return all built in and custom types
      if (
        textUntilPosition.trim().match(/[a-zA-Z0-9_]+:/) ||
        textUntilPosition.trim().match(/:\s*"/g)
      ) {
        return {
          suggestions: this.getCodeCompletionItems(
            textUntilPosition,
            builtInTypes,
            'SCALAR'
          )
            .concat(
              this.getCodeCompletionItems(
                textUntilPosition,
                builtInTypes,
                'OBJECT'
              )
            )
            .concat(
              this.getCodeCompletionItems(
                textUntilPosition,
                customTypes,
                'OBJECT'
              )
            ) as CompletionItem[],
        } as CompletionList;
      }

      return { suggestions: [] } as CompletionList;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return { suggestions: [] } as CompletionList;
    }
  }

  private getDirectiveName(textUntilPosition: string) {
    return textUntilPosition.match(/@[a-zA-Z0-9_]+/)?.[0].replace(/@/g, '');
  }

  private getCurrentDirectiveArgument(textUntilPosition: string) {
    return textUntilPosition
      .trim()
      .match(/[a-zA-Z]+:\s*"$/)?.[0]
      .replace(/(:|")/g, '');
  }

  private getDirectiveArgumentByKind(
    textUntilPosition: string,
    kind: ArgumentNodeProps['kind']
  ) {
    const directiveName = this.getDirectiveName(textUntilPosition);

    return this.dataModelTypeDefs?.directives
      ?.find((directive) => directive.name === directiveName)
      ?.arguments?.find((argument) => argument.kind === kind);
  }

  private getTypeNameFromLine(
    textUntilPosition: string,
    parameterName: string
  ) {
    const fieldLevelParameterPattern = new RegExp(
      parameterName + ':\\s*"[A-Z][a-zA-Z0-9_]+"\\s*'
    );
    const fieldLevelMatch = textUntilPosition
      .trim()
      .match(fieldLevelParameterPattern);

    if (fieldLevelMatch) {
      return fieldLevelMatch[0]
        .replace(parameterName, '')
        .replaceAll(/("|:|\s)/g, '');
    }

    return '';
  }

  /** Does lookup into current types and returns suggestions based on the completionType  */
  private getCodeCompletionItems(
    textUntilPosition: string,
    builtInTypes: BuiltInType[],
    completionType: string
  ) {
    const prefix = completionType === 'DIRECTIVE' ? '@' : '';

    // filter code completion items from type
    return builtInTypes
      .filter((builtInType) => {
        if (builtInType.type === 'DIRECTIVE') {
          return true;
        }
        return builtInType.type === completionType;
      })
      .flatMap((builtInType) =>
        this.toCompletionItem(
          textUntilPosition,
          builtInType,
          this.iconsMap[completionType],
          prefix
        )
      );
  }

  /** Format the text, adds icon and returns in format that monaco editor expects */
  private toCompletionItem(
    textUntilPosition: string,
    type: BuiltInType,
    iconKind: CompletionItemKind,
    prefix = ''
  ) {
    // check the current line that the user is editing
    // if matches on of this formats, just add the type, otherwise add space
    /**
     * Formats:
     * 1. field:{space}
     * 2. {space}
     * 2. @
     */
    let insertText = textUntilPosition.match(/(:[\s]{1,}|[\s]{1,}|[@])/)
      ? type.name
      : ' ' + type.name;

    // if current line does not include prefix and insert text does not includes also
    // just append in the line. Prefix could be something like "@"
    if (!insertText.includes(prefix) && !textUntilPosition.includes(prefix)) {
      insertText = prefix + insertText;
    }

    const directive = this.dataModelTypeDefs?.directives?.find(
      (directive) => directive.name === type.name
    );

    if (textUntilPosition.trim().match(/(\(|,)$/) && directive) {
      const availableArgs =
        directive?.arguments?.filter(
          (argument) => !textUntilPosition.split('@')[1].includes(argument.name)
        ) || [];

      return availableArgs.map(
        (arg) =>
          ({
            label: arg.name,
            kind: iconKind,
            insertText: `${arg.name}:`,
            insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
          } as CompletionItem)
      );
    }

    return {
      label: type.name,
      kind: iconKind,
      insertText,
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
    } as CompletionItem;
  }

  private getCompletionItemsFromFieldTypes(
    typeName: string,
    dataModelTypeDefs: DataModelTypeDefs | null,
    iconKind: CompletionItemKind
  ) {
    const fields =
      dataModelTypeDefs?.types.find((type) => type.name === typeName)?.fields ||
      [];

    return fields.map(
      ({ name }) =>
        ({
          label: name,
          kind: iconKind,
          insertText: name,
          insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
        } as CompletionItem)
    );
  }
}
