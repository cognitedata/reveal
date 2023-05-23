import {
  Command,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
  scrollPastEnd,
} from '@codemirror/view';
import {
  defaultKeymap,
  historyKeymap,
  history,
  indentLess,
  insertTab,
} from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintGutter, lintKeymap } from '@codemirror/lint';
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';

const PHRASES: Record<string, string> = {
  // @codemirror/view
  'Control character': 'Control character',
  // @codemirror/language
  'Folded lines': 'Folded lines',
  'Unfolded lines': 'Unfolded lines',
  to: 'to',
  'folded code': 'folded code',
  unfold: 'Unfold',
  'Fold line': 'Fold line',
  'Unfold line': 'Unfold line',
  // @codemirror/search
  'Go to line': 'Go to line',
  go: 'go',
  Find: 'Find',
  Replace: 'Replace',
  next: 'Next',
  previous: 'Previous',
  all: 'All',
  'match case': 'Match case',
  replace: 'Replace',
  'replace all': 'Replace all',
  close: 'close',
  'current match': 'current match',
  'replaced $ matches': 'replaced {{count}} matches',
  'replaced match on line $': 'replaced match on line {{line}}',
  'on line': 'on line',
  // @codemirror/autocomplete
  Completions: 'Completions',
  // @codemirror/lint
  Diagnostics: 'Diagnostics',
  'No diagnostics': 'No diagnostics',
};

export type CommandFunction = (args: any[]) => void;

/**
 * Turns standard functions into CodeMirror commands. Returning `true` means no
 * other command should be executed for this keypress.
 */
export const getCommands = (
  functions: Record<string, CommandFunction | undefined>
) => {
  return Object.keys(functions).reduce(
    (commands, key) => ({
      ...commands,
      [key]: functions[key]
        ? (...args: any[]) => {
            functions[key]?.(args);
            return true;
          }
        : () => false,
    }),
    {} as Record<string, Command>
  );
};

export const getHotkeyExtension = ({ onRun }: Record<string, Command>) => {
  const customHotkeys = [
    {
      key: 'Mod-Enter',
      run: onRun,
    },
    {
      key: 'Shift-Tab',
      run: indentLess,
    },
    {
      key: 'Tab',
      run: acceptCompletion,
    },
    {
      key: 'Tab',
      run: insertTab,
    },
  ];

  return keymap.of([
    ...customHotkeys,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]);
};

export const getExtensions = (
  commands: Record<string, CommandFunction | undefined>,
  disabled?: boolean
) => {
  return [
    lintGutter(),
    lineNumbers(),
    foldGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),
    getHotkeyExtension(getCommands(commands)),
    EditorState.phrases.of(PHRASES),
    ...[
      disabled
        ? []
        : [scrollPastEnd(), highlightActiveLine(), highlightActiveLineGutter()],
    ],
  ];
};
