import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import Editor from '@monaco-editor/react';
import { useDebounce } from '@platypus-app/hooks/useDebounce';
import React, { useEffect, useState } from 'react';

type Props = {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export const GraphqlCodeEditor = React.memo(
  ({ onChange, code, disabled = false }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const editorValueDebounced = useDebounce(editorValue, 500);

    useEffect(() => {
      onChange(editorValueDebounced);
    }, [editorValueDebounced, onChange]);

    useEffect(() => {
      setEditorValue(code);
    }, [code]);

    return (
      <Editor
        options={{
          minimap: { enabled: false },
          autoClosingBrackets: 'always',
          readOnly: disabled,
        }}
        language="graphql"
        value={editorValue}
        loading={<Spinner />}
        onChange={(value) => {
          const editCode = value || '';
          setEditorValue(editCode);
        }}
      />
    );
  }
);
