import { useMemo } from 'react';

import styled from 'styled-components';

import { sql as sqlLang } from '@codemirror/lang-sql';
import { sparkSQLDialect } from '@transformations/utils';

import { CodeSnippet } from '@cognite/cdf-utilities';

type PreviewEditorProps = {
  sql: string;
};

export default function SqlEditor({ sql }: PreviewEditorProps) {
  const extensions = useMemo(
    () => [
      sqlLang({
        dialect: sparkSQLDialect,
      }),
    ],
    []
  );

  return (
    <StyledEditorContainer>
      <StyledCodeSnippet extensions={extensions} value={sql} />
    </StyledEditorContainer>
  );
}

const StyledCodeSnippet = styled(CodeSnippet)`
  height: 100%;
`;

const StyledEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  > * {
    height: 100%;
  }
`;
