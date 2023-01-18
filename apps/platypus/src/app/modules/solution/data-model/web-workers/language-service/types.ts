/**
 * This types are copied from monaco-editor
 * Reason is that when importing them directly
 * webpack was not able to resolve them and app was not compiling
 */
export enum CompletionItemKind {
  Method = 0,
  Function = 1,
  Constructor = 2,
  Field = 3,
  Variable = 4,
  Class = 5,
  Struct = 6,
  Interface = 7,
  Module = 8,
  Property = 9,
  Event = 10,
  Operator = 11,
  Unit = 12,
  Value = 13,
  Constant = 14,
  Enum = 15,
  EnumMember = 16,
  Keyword = 17,
  Text = 18,
  Color = 19,
  File = 20,
  Reference = 21,
  Customcolor = 22,
  Folder = 23,
  TypeParameter = 24,
  User = 25,
  Issue = 26,
  Snippet = 27,
}

export enum CompletionItemInsertTextRule {
  /**
   * Adjust whitespace/indentation of multiline insert texts to
   * match the current line indentation.
   */
  KeepWhitespace = 1,
  /**
   * `insertText` is a snippet.
   */
  InsertAsSnippet = 4,
}

export type CompletionItem = {
  label: string;
  kind: CompletionItemKind;
  /**
   * A human-readable string with additional information
   * about this item, like type or symbol information.
   */
  detail?: string;
  /**
   * A human-readable string that represents a doc-comment.
   */
  documentation?: string;
  /**
   * A string or snippet that should be inserted in a document when selecting
   * this completion.
   */
  insertText: string;

  /**
   * Additional rules (as bitmask) that should be applied when inserting
   * this completion.
   */
  insertTextRules: CompletionItemInsertTextRule;
};
export type CompletionList = {
  suggestions: CompletionItem[];
};

export type LocationTypesMap = Record<
  string,
  { name: string; kind: 'type' | 'field'; typeName: string }
>;

export type HoverItem = {
  content: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
};
