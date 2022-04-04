import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import Editor, { Monaco } from '@monaco-editor/react';
import { useDebounce } from '@platypus-app/hooks/useDebounce';
import React, { useEffect, useState } from 'react';
import { BuiltInType } from '@platypus/platypus-core';
import { setupGraphql } from './utils/graphqlSetup';
import { config } from './utils/config';

type Props = {
  code: string;
  builtInTypes: BuiltInType[];
  onChange: (code: string) => void;
  disabled?: boolean;
};

export const GraphqlCodeEditor = React.memo(
  ({ onChange, code, builtInTypes, disabled = false }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const editorValueDebounced = useDebounce(editorValue, 500);

    function editorWillMount(monaco: Monaco) {
      const languageId = config.languageId;
      monaco.languages.onLanguage(languageId, () => {
        setupGraphql(monaco, builtInTypes);
      });
    }

    useEffect(() => {
      onChange(editorValueDebounced);
    }, [editorValueDebounced, onChange]);

    useEffect(() => {
      setEditorValue(code);
    }, [code]);

    return (
      <div style={{ height: 'calc(100% - 56px)' }}>
        <Editor
          options={{
            minimap: { enabled: false },
            autoClosingBrackets: 'always',
            renderValidationDecorations: 'on',
            readOnly: disabled,
          }}
          language="graphql"
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          onChange={(value) => {
            const editCode = value || '';
            setEditorValue(editCode);
          }}
        />
      </div>
    );
  }
);
