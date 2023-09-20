import React, { useEffect, useMemo, useRef, useState } from 'react';

import Editor, { Monaco } from '@monaco-editor/react';
import { DataModelTypeDefs } from '@platypus/platypus-core';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import {
  Environment as MonacoEditorEnvironment,
  editor as MonacoEditor,
  MarkerSeverity,
} from 'monaco-editor/esm/vs/editor/editor.api';

import { setupGraphql } from '../../web-workers';
// web workers stuff
import { getGraphQlWorker } from '../../web-workers/worker-loaders/graphqlWorkerLoader';

import { StyledEditor } from './elements';
import { ErrorsByGroup } from './Model';

const getSampleDataModel = (
  space = 'your-space'
) => `# Welcome to the data model editor
# Using GraphQL you can easily create a data model
# You can start with the example below or delete everything and 
# start from scratch
# Documentation: https://developer.cognite.com/dm/graphql/modeling

# Useful shortcuts:
# "CTRL + /" or "CMD + /" to comment in/out code
# "CTRL + SPACE" for auto complete

# For quick start, comment everything below

# "this is a description of the type Pump"
# type Pump {
#     # fields containing basic data, where "!" means it is required
#     name: String!
#     year: Int
#     "this is a description of the field weight"
#     weight: Float
#     weightUnit: String
#     # fields that contains CDF resources
#     pressure: TimeSeries
#     temperature: TimeSeries
#     # fields that indicates a relationship to another custom defined types
#     livesIn: Facility
# }

# type Facility {
#     name: String!
#     desc: String!
#     # CDF has additional relations to make defining more complex cases easier
#     # https://developer.cognite.com/dm/concepts/bidirectional_relation/
#     # in this case, we want a bi-directional relationship of
#     # Pump.livesIn <-> Facility.hasPumps
#     hasPumps: [Pump] @relation(
#         direction: INWARDS, 
#         type: { externalId: "Pump.livesIn", space: "${space}" }
#     )
# }

`;

// point here so the context can be used
declare const self: any;
(self as any).MonacoEnvironment = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWorker(_: string, label: string) {
    return getGraphQlWorker();
  },
} as MonacoEditorEnvironment;

type Props = {
  code: string;
  currentTypeName?: string;
  typeDefs?: DataModelTypeDefs;
  space?: string;
  disabled?: boolean;
  language?: string;
  errorsByGroup?: ErrorsByGroup;
  setErrorsByGroup?: (errors: ErrorsByGroup) => void;
  setEditorHasError?: (hasError: boolean) => void;
  onChange?: (code: string) => void;
};

export const GraphqlCodeEditor = React.memo(
  ({
    code,
    currentTypeName,
    space,
    typeDefs,
    disabled = false,
    errorsByGroup = {},
    setErrorsByGroup = noop,
    language = 'graphql',
    onChange = noop,
    setEditorHasError = noop,
  }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const langProviders = useRef<any>(null);
    const [editorRef, setEditorRef] =
      useState<MonacoEditor.IStandaloneCodeEditor | null>(null);

    const editorWillMount = (monacoInstance: Monaco) => {
      langProviders.current = setupGraphql(monacoInstance, {
        useExtendedSdl: true,
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
            fixedOverflowWidgets: true,
          }}
          language={language}
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          onMount={handleEditorDidMount}
          defaultValue={getSampleDataModel(space)}
          defaultLanguage={language}
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
