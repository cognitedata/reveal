import { getBuiltInTypesString } from '@platypus/platypus-common-utils';
import { buildSchema } from 'graphql';
import {
  CompletionItem,
  getAutocompleteSuggestions,
  Position as GLSPosition,
  IRange as GLSRange,
} from 'graphql-language-service';
import { IRange, Position } from 'monaco-editor/esm/vs/editor/editor.api';

import { CompletionItemKind, CompletionList } from './types';

/**
 * TS class for handling code completion and suggestions.
 * Used in the web worker
 */

const UNSUPPORTED_LIST = [
  {
    label: 'deprecated',
    kind: CompletionItemKind.Field,
  },
  {
    label: 'extend',
    kind: CompletionItemKind.Field,
  },
  {
    label: 'union',
    kind: CompletionItemKind.Field,
  },
  {
    label: 'input',
    kind: CompletionItemKind.Field,
  },
  {
    label: 'scalar',
    kind: CompletionItemKind.Field,
  },
  {
    label: 'schema',
    kind: CompletionItemKind.Field,
  },
];
export class CodeCompletionService {
  getCompletions(
    currentCode: string,
    mostRecentDataModel: string,
    position: Position,
    useExtendedSdl: boolean
  ): CompletionList {
    try {
      const schema = buildSchema(
        [
          useExtendedSdl ? getBuiltInTypesString() : '',
          mostRecentDataModel,
        ].join('\n')
      );

      const glsResults = getAutocompleteSuggestions(
        schema,
        currentCode,
        new GLSPosition(position.lineNumber - 1, position.column - 1)
      );

      const filteredResults = glsResults.filter(
        (suggestion) =>
          suggestion.label.startsWith('_') ||
          !UNSUPPORTED_LIST.some(
            (el) => el.kind === suggestion.kind && el.label === suggestion.label
          )
      );

      return {
        suggestions: filteredResults.map((el) => this.toCompletionItem(el)),
      } as CompletionList;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return { suggestions: [] } as CompletionList;
    }
  }

  /** Format the text, adds icon and returns in format that monaco editor expects */
  private toCompletionItem(
    entry: CompletionItem,
    range?: GLSRange
  ): CompletionItem {
    const results = {
      label: entry.label,
      insertText: entry.insertText || entry.label,
      insertTextFormat: entry.insertTextFormat,
      sortText: entry.sortText,
      filterText: entry.filterText,
      documentation: entry.documentation,
      detail: entry.detail,
      range: range ? toMonacoRange(range) : undefined,
      kind: entry.kind,
    };
    if (entry.insertTextFormat) {
      results.insertTextFormat = entry.insertTextFormat;
    }

    if (entry.command) {
      //@ts-ignore
      results.command = { ...entry.command, id: entry.command.command };
    }

    return results;
  }
}

function toMonacoRange(range: GLSRange): IRange {
  return {
    startLineNumber: range.start.line + 1,
    startColumn: range.start.character + 1,
    endLineNumber: range.end.line + 1,
    endColumn: range.end.character + 1,
  };
}
