import Editor, { Monaco } from '@monaco-editor/react';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { BuiltInType } from '@platypus/platypus-core';
import debounce from 'lodash/debounce';
import { Environment as MonacoEditorEnvironment } from 'monaco-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// web workers stuff
import { setupGraphql } from '../../web-workers';
import GraphQlWorker from '../../web-workers/worker-loaders/graphqlWorkerLoader';
import MonacoEditorWorker from '../../web-workers/worker-loaders/monacoLanguageServiceWorkerLoader';

import { isFDMv3 } from '@platypus-app/flags';

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
  builtInTypes: BuiltInType[];
  externalId: string;
  space: string;
  version: string;
  disabled?: boolean;
  onChange: (code: string) => void;
};

export const GraphqlCodeEditor = React.memo(
  ({ code, builtInTypes, externalId, disabled = false, onChange }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const langProviders = useRef<any>(null);

    const { track } = useMixpanel();

    const editorWillMount = (monacoInstance: Monaco) => {
      langProviders.current = setupGraphql(monacoInstance, builtInTypes, {
        useExtendedSdl: isFDMv3(),
      });
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
      setEditorValue(code);
    }, [code]);

    useEffect(() => {
      track('CodeEditor', { dataModel: externalId });
    }, [track, externalId]);

    useEffect(() => {
      // Destroy lang services when component is unmounted
      return () => {
        if (langProviders.current) {
          langProviders.current.dispose();
        }
      };
    }, []);

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
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
          }}
          language="graphql"
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          defaultLanguage="graphql"
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
