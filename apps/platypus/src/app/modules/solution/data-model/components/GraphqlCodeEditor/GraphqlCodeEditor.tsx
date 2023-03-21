import Editor, { Monaco } from '@monaco-editor/react';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { DataModelTypeDefs } from '@platypus/platypus-core';
import debounce from 'lodash/debounce';
import {
  Environment as MonacoEditorEnvironment,
  editor as MonacoEditor,
  MarkerSeverity,
} from 'monaco-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorsByGroup } from './Model';

// web workers stuff
import { setupGraphql } from '../../web-workers';
import GraphQlWorker from '../../web-workers/worker-loaders/graphqlWorkerLoader';
import MonacoEditorWorker from '../../web-workers/worker-loaders/monacoLanguageServiceWorkerLoader';

import { isFDMv3 } from '@platypus-app/flags';
import { StyledEditor } from './elements';

// point here so the context can be used
declare const self: any;

(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    // // when graphql, load our custom web worker
    if (label === 'graphql') {
      return new GraphQlWorker();
    }

    // otherwise, load the default web worker from monaco
    return new MonacoEditorWorker();
  },
} as MonacoEditorEnvironment;

type Props = {
  code: string;
  currentTypeName: string | null;
  typeDefs: DataModelTypeDefs | null;
  externalId: string;
  disabled?: boolean;
  errorsByGroup: ErrorsByGroup;
  setErrorsByGroup: (errors: ErrorsByGroup) => void;
  setEditorHasError: (hasError: boolean) => void;
  onChange: (code: string) => void;
};

export const GraphqlCodeEditor = React.memo(
  ({
    code,
    currentTypeName,
    typeDefs,
    disabled = false,
    errorsByGroup,
    setErrorsByGroup,
    onChange,
    setEditorHasError,
  }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const langProviders = useRef<any>(null);
    const [editorRef, setEditorRef] =
      useState<MonacoEditor.IStandaloneCodeEditor | null>(null);

    const editorWillMount = (monacoInstance: Monaco) => {
      langProviders.current = setupGraphql(monacoInstance, {
        useExtendedSdl: isFDMv3(),
      });
    };

    const handleEditorDidMount = (
      editor: MonacoEditor.IStandaloneCodeEditor
    ) => {
      setEditorRef(editor);
    };

    const debouncedOnChange = useMemo(
      () => debounce((value: string) => onChange(value), 500),
      [onChange]
    );

    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);

    useEffect(() => {
      if (currentTypeName && editorRef && typeDefs) {
        const selectedType = typeDefs?.types.find(
          (typeDef) => typeDef.name === currentTypeName
        );

        if (selectedType?.location) {
          // scroll the editor to this line
          editorRef.revealLine(selectedType.location.line);
          // set the focus there
          editorRef.setPosition({
            column: selectedType?.location.column,
            lineNumber: selectedType?.location.line,
          });
        }
      }

      // eslint-disable-next-line
    }, [editorRef, currentTypeName]);

    useEffect(() => {
      setEditorValue(code);
    }, [code]);

    useEffect(() => {
      // Destroy lang services when component is unmounted
      return () => {
        if (langProviders.current) {
          langProviders.current.dispose();
        }
      };
    }, []);

    useEffect(() => {
      const editorModel = editorRef?.getModel();
      if (editorModel != null) {
        Object.entries(errorsByGroup).forEach(([group, markers]) =>
          MonacoEditor.setModelMarkers(editorModel, group, markers)
        );
      }
    }, [errorsByGroup, editorRef]);

    return (
      <StyledEditor>
        <Editor
          options={{
            minimap: { enabled: false },
            autoClosingBrackets: 'always',
            renderValidationDecorations: 'on',
            readOnly: disabled,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
          }}
          language="graphql"
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          onMount={handleEditorDidMount}
          defaultLanguage="graphql"
          onValidate={(markers) => {
            setEditorHasError(
              markers.some(
                (marker) =>
                  marker.severity === MarkerSeverity.Error &&
                  marker.owner === 'graphql'
              )
            );
          }}
          onChange={(value) => {
            const editCode = value || '';
            debouncedOnChange(editCode);
            setErrorsByGroup({ DmlError: [] });
            setEditorValue(editCode);
          }}
        />
      </StyledEditor>
    );
  }
);
