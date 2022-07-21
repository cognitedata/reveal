import Editor, { Monaco } from '@monaco-editor/react';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
  BuiltInType,
  DataModelValidationError,
  DataModelVersionHandler,
} from '@platypus/platypus-core';
import debounce from 'lodash/debounce';
import { MarkerSeverity } from 'monaco-editor';
import React, { useEffect, useMemo, useState } from 'react';
import { config } from './utils/config';
import { setupGraphql } from './utils/graphqlSetup';
import { ValidationMarker } from './utils/types';

type Props = {
  code: string;
  builtInTypes: BuiltInType[];
  dataModelVersionHandler: DataModelVersionHandler;
  externalId: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export const GraphqlCodeEditor = React.memo(
  ({
    onChange,
    code,
    builtInTypes,
    dataModelVersionHandler,
    externalId,
    disabled = false,
  }: Props) => {
    const [editorValue, setEditorValue] = useState(code);

    const validateFn = async (graphQLString: string) => {
      const result = await dataModelVersionHandler.validate({
        externalId,
        schema: graphQLString,
      });

      if (result.isSuccess) {
        return [];
      }

      const markers = [] as ValidationMarker[];

      // Monaco editor needs them as separate lines
      (result.error as DataModelValidationError[]).forEach(
        (validationError) => {
          const locations = validationError.locations || [];

          locations.forEach((validationErrorLocation) => {
            const err = {
              severity: validationError.extensions?.breakingChangeInfo
                ? MarkerSeverity.Warning
                : MarkerSeverity.Error,
              startLineNumber: validationErrorLocation.line,
              startColumn: 1,
              endLineNumber: validationErrorLocation.line,
              endColumn: validationErrorLocation.column,
              message: validationError.message,
            };

            markers.push(err);
          });
        }
      );

      return markers;
    };

    function editorWillMount(monaco: Monaco) {
      const languageId = config.languageId;
      monaco.languages.onLanguage(languageId, () => {
        setupGraphql(monaco, builtInTypes, validateFn);
      });
    }
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
