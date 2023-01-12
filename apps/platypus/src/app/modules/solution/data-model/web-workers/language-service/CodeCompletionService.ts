import { BuiltInType } from '@platypus/platypus-core';
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

  getCompletions(
    graphQlString: string,
    textUntilPosition: string,
    builtInTypes: BuiltInType[],
    useExtendedSdl: boolean
  ): CompletionList {
    try {
      const customTypes = [] as BuiltInType[];
      const fieldTypes = [] as string[];
      const objectAndInterfaceDirectives = builtInTypes.filter(
        (type) => !type.fieldDirective
      );

      // extract all current custom types from code editor
      (
        graphQlString.match(/^(type|interface)\s{1,}[A-Z][a-zA-Z0-9_]+/gm) || []
      ).forEach((matchedType: string) => {
        // Do something with each element
        customTypes.push({
          name: matchedType.replace('type ', '').replace('interface ', ''),
          type: 'OBJECT',
        });
      });

      // extract all current fields from code editor
      (graphQlString.match(/^\s*[a-zA-Z0-9_]+:/gm) || []).forEach(
        (matchedType: string) => {
          fieldTypes.push(matchedType.replaceAll(' ', '').replace(':', ''));
        }
      );

      // graphql sdl v3 code completion
      if (useExtendedSdl) {
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
            // suggest possible custom types for the directive parameter
            if (textUntilPosition.trim().match(/:\s*"$/)) {
              return {
                suggestions: this.getCodeCompletionItems(
                  textUntilPosition,
                  customTypes,
                  'OBJECT'
                ) as CompletionItem[],
              } as CompletionList;
            }

            // suggest possible arguments for the directive
            if (
              textUntilPosition.trim().match(/"\s*,$/) ||
              textUntilPosition.trim().match(/\s*\($/)
            ) {
              const directive = textUntilPosition.match(/@[a-zA-Z0-9_]+/)?.[0];
              const directiveArguments = objectAndInterfaceDirectives.filter(
                (type) => directive?.includes(type.name)
              );
              return {
                suggestions: this.getCodeCompletionItems(
                  textUntilPosition,
                  directiveArguments,
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

          if (textUntilPosition.trim().match(/:\s*"$/)) {
            return {
              suggestions: this.getCodeCompletionItems(
                textUntilPosition,
                customTypes,
                'OBJECT'
              ).concat(
                this.getCompletionItemsFromFieldTypes(
                  textUntilPosition,
                  fieldTypes,
                  this.iconsMap['DIRECTIVE']
                )
              ) as CompletionItem[],
            } as CompletionList;
          }

          if (
            textUntilPosition.trim().match(/"\s*,$/) ||
            textUntilPosition.trim().match(/\s*@$/) ||
            textUntilPosition.trim().match(/\s*\($/)
          ) {
            return {
              suggestions: this.getCodeCompletionItems(
                textUntilPosition,
                fieldDefinitionDirectives,
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

    if (textUntilPosition.trim().match(/[(|,]/gm) && type.body) {
      return this.getCompletionItemsFromTypeBody(
        textUntilPosition,
        type,
        iconKind
      );
    }

    return {
      label: type.name,
      kind: iconKind,
      insertText,
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
    } as CompletionItem;
  }

  private getCompletionItemsFromTypeBody(
    textUntilPosition: string,
    type: BuiltInType,
    iconKind: CompletionItemKind
  ) {
    return type.body
      ? type.body
          .replace(/[():\s]/g, '')
          .replace(/String/g, '')
          .split(',')
          .filter((label) => !textUntilPosition.includes(label))
          .map(
            (label) =>
              ({
                label,
                kind: iconKind,
                insertText: `${label}:`,
                insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
              } as CompletionItem)
          )
      : [];
  }

  private getCompletionItemsFromFieldTypes(
    textUntilPosition: string,
    fields: string[],
    iconKind: CompletionItemKind
  ) {
    const uniqueFieldNames = new Set(fields);
    return [...uniqueFieldNames]
      .filter((label) => !textUntilPosition.includes(label))
      .map(
        (label) =>
          ({
            label,
            kind: iconKind,
            insertText: label,
            insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
          } as CompletionItem)
      );
  }
}
