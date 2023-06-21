import { useState, useCallback } from 'react';

import MonacoEditor, { DiffEditor, OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';

import { Flex } from '@cognite/cogs.js';

export interface EditorProps {
  code: string;
  prevCode?: string;
  language: string;
}

export const Editor = ({ code, prevCode, language }: EditorProps) => {
  const [_editorRef, setEditorRef] = useState<
    editor.IStandaloneCodeEditor | undefined
  >();

  const [_monacoRef, setMonacoRef] = useState<typeof monaco | undefined>();
  const handleEditorDiDMount = useCallback<OnMount>((newEditor, newMonaco) => {
    setEditorRef(newEditor);
    setMonacoRef(newMonaco);
  }, []);

  return (
    <Flex
      style={{
        flex: 1,
        position: 'relative',
      }}
      direction="column"
    >
      {prevCode ? (
        <DiffEditor
          original={prevCode}
          modified={code}
          options={{
            readOnly: true,
          }}
          theme="light"
          language={language}
        />
      ) : (
        <MonacoEditor
          defaultValue={code}
          value={code}
          options={{
            readOnly: true,
          }}
          onMount={handleEditorDiDMount}
          theme="light"
          language={language}
          defaultLanguage={language}
        />
      )}
    </Flex>
  );
};
