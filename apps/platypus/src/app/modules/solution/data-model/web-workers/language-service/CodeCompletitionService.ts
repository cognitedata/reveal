import { BuiltInType } from '@platypus/platypus-core';
import {
  CompletionItem,
  CompletionList,
  CompletionItemKind,
  CompletionItemInsertTextRule,
} from './types';

/**
 * TS class for handling code completition and suggestions.
 * Used in the web worker
 */
export class CodeCompletitionService {
  getCompletitions(
    graphQlString: string,
    textUntilPosition: string,
    builtInTypes: BuiltInType[]
  ): CompletionList {
    try {
      const customTypes = [] as BuiltInType[];

      // extract all current custom types from code editor
      (graphQlString.match(/type\s[A-Z][a-zA-Z0-9_]+/gm) || []).forEach(
        (matchedType: string) => {
          // Do something with each element
          customTypes.push({
            name: matchedType.replace('type ', ''),
            type: 'OBJECT',
          });
        }
      );

      // handle case when user request code completition
      // for type. In this case return directives from built in types
      if (textUntilPosition.trim().match(/type [A-Z][a-zA-Z0-9_]+/)) {
        return {
          suggestions: this.getCodeCompletitionItems(
            textUntilPosition,
            builtInTypes,
            'DIRECTIVE'
          ),
        } as CompletionList;
      }

      // handle case when user request code completition
      // for field. In this case return all built in and custom types
      if (textUntilPosition.trim().match(/[a-zA-Z0-9_]+:/)) {
        return {
          suggestions: this.getCodeCompletitionItems(
            textUntilPosition,
            builtInTypes,
            'SCALAR'
          )
            .concat(
              this.getCodeCompletitionItems(
                textUntilPosition,
                builtInTypes,
                'OBJECT'
              )
            )
            .concat(
              this.getCodeCompletitionItems(
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

  /** Does lookup into current types and returns suggestions based on the completitionType  */
  private getCodeCompletitionItems(
    textUntilPosition: string,
    builtInTypes: BuiltInType[],
    completitionType: string
  ) {
    const iconsMap = {
      DIRECTIVE: CompletionItemKind.Interface,
      OBJECT: CompletionItemKind.Class,
      SCALAR: CompletionItemKind.Text,
    } as {
      [key: string]: CompletionItemKind;
    };
    const prefix = completitionType === 'DIRECTIVE' ? '@' : '';

    // filter code completition items from type
    return builtInTypes
      .filter((builtInType) => {
        if (builtInType.type === 'DIRECTIVE') {
          return true;
        }
        return builtInType.type === completitionType;
      })
      .map((builtInType) =>
        this.toCompletitionItem(
          textUntilPosition,
          builtInType,
          iconsMap[completitionType],
          prefix
        )
      );
  }

  /** Format the text, adds icon and returns in format that monaco editor expects */
  private toCompletitionItem(
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

    return {
      label: type.name,
      kind: iconKind,
      insertText,
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
    } as CompletionItem;
  }
}
