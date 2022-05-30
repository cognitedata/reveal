import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import Editor, { Monaco } from '@monaco-editor/react';
import React, { useEffect, useMemo, useState } from 'react';
import { BuiltInType } from '@platypus/platypus-core';
import { setupGraphql } from './utils/graphqlSetup';
import { config } from './utils/config';
import debounce from 'lodash/debounce';

type Props = {
  code: string;
  builtInTypes: BuiltInType[];
  onChange: (code: string) => void;
  disabled?: boolean;
};

export const GraphqlCodeEditor = React.memo(
  ({ onChange, code, builtInTypes, disabled = false }: Props) => {
    const [editorValue, setEditorValue] = useState(code);

    function editorWillMount(monaco: Monaco) {
      const languageId = config.languageId;
      monaco.languages.onLanguage(languageId, () => {
        setupGraphql(monaco, builtInTypes);
      });
    }
    const debouncedOnChange = useMemo(
      () => debounce((value: string) => onChange(value), 500),
      []
    );
    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);
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
            overviewRulerLanes: 0,
            renderLineHighlight: 'none',
            scrollBeyondLastLine: false,
          }}
          language="graphql"
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          onChange={(value) => {
            const editCode = value || '';
            debouncedOnChange(editCode);
            setEditorValue(editCode);
          }}
        />
      </div>
    );
  }
);
