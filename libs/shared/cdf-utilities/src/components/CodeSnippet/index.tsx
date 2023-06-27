/* eslint-disable @cognite/no-number-z-index */
import React from 'react';

import styled from 'styled-components';

import { CodeEditor, CodeEditorProps } from '../CodeEditor';
import { CopyButton } from '../CopyButton';

export type CodeSnippetProps = Omit<CodeEditorProps, 'disabled'>;

export const CodeSnippet = (props: CodeSnippetProps): JSX.Element => {
  return (
    <StyledCodeSnippetContainer>
      <CodeEditor disabled {...props} />
      <StyledCopyButtonContainer>
        <CopyButton content={props.value} />
      </StyledCopyButtonContainer>
    </StyledCodeSnippetContainer>
  );
};

const StyledCodeSnippetContainer = styled.div`
  position: relative;

  .cm-editor {
    border-radius: 6px;
  }

  .cm-gutters {
    border-radius: 6px 0 0 6px;
  }
`;

const StyledCopyButtonContainer = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 1;
`;
