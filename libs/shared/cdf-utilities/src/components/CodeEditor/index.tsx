import React, { ComponentProps, useMemo } from 'react';

import styled from 'styled-components';

import ReactCodeMirror from '@uiw/react-codemirror';

import { CommandFunction, getExtensions } from './extensions';
import { editorStyle, getTheme } from './theme';

export type CodeEditorTheme = 'light' | 'dark';

export type CodeEditorProps = {
  disabled?: boolean;
  /**
   * This function needs to be memoized - issues like CDFUX-1782 occurs otherwise
   */
  onRun?: CommandFunction;
  theme?: CodeEditorTheme;
} & Omit<
  ComponentProps<typeof ReactCodeMirror>,
  | 'basicSetup'
  | 'contentEditable'
  | 'editable'
  | 'indentWithTab'
  | 'readOnly'
  | 'theme'
>;

export const CodeEditor = ({
  autoFocus = true,
  disabled,
  extensions = [],
  onRun,
  theme,
  ...props
}: CodeEditorProps): JSX.Element => {
  const memoizedExtensions = useMemo(() => {
    return [...getExtensions({ onRun }, disabled), ...extensions];
  }, [disabled, extensions, onRun]);

  return (
    <StyledCodeMirror
      {...props}
      autoFocus={autoFocus && !disabled}
      editable={!disabled}
      readOnly={disabled}
      basicSetup={false}
      indentWithTab={false}
      extensions={memoizedExtensions}
      theme={getTheme(theme)}
    />
  );
};

const StyledCodeMirror = styled(ReactCodeMirror)`
  flex-grow: 1;
  flex-basis: 0;
  height: 100%;
  min-height: 0;

  && {
    ${editorStyle()};
  }
`;
