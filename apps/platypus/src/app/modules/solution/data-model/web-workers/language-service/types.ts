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

/** We can not use the ones from Monaco, so this are the exact same one from there */
export enum MarkerSeverity {
  Warning = 4,
  Error = 8,
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

export type CodeEditorRange = {
  /**
   * Line number on which the range starts (starts at 1).
   */
  readonly startLineNumber: number;
  /**
   * Column on which the range starts in line `startLineNumber` (starts at 1).
   */
  readonly startColumn: number;
  /**
   * Line number on which the range ends.
   */
  readonly endLineNumber: number;
  /**
   * Column on which the range ends in line `endLineNumber`.
   */
  readonly endColumn: number;
};

export type HoverItem = {
  content: string;
  range: CodeEditorRange;
};

/** Item returned from DiagnosticsAdapter (MarkerData) */
export type DiagnosticItem = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  // eslint-disable-next-line
  code?: string | any;
  source?: string;
};

export type CodeActionsOptions = {
  lineCount: number;
  lastLineLength: number;
};

export type CodeActionEditItem = {
  range: CodeEditorRange;
  text: string;
};
export type CodeActionEdit = {
  edits: {
    edit: CodeActionEditItem;
  }[];
};

// Type used by monaco-editor (can not use the one directly in worker)
// had to create this type
export type EditorCodeAction = {
  title: string;
  diagnostics: DiagnosticItem[];
  kind: string;
  edit: CodeActionEdit;
  isPreferred: boolean;
};
