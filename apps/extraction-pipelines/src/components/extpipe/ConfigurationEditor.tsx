import React from 'react';
import styled from 'styled-components';
import { useExtpipeConfig } from 'hooks/config';
import { StreamLanguage } from '@codemirror/language';
import { createTheme } from '@uiw/codemirror-themes';
import ReactCodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import ConfigurationErrorFeedback from './ConfigurationError';
import { tags as t } from '@lezer/highlight';
import { Colors } from '@cognite/cogs.js';

type Props = {
  externalId: string;
  revision?: number;
  editable?: boolean;
  onChange?: (s: string) => void;
};
export default function ConfigurationEditor({
  externalId,
  revision,
  editable = false,
  onChange,
}: Props) {
  const {
    data: configuration,
    isSuccess,
    error,
  } = useExtpipeConfig({
    externalId,
    revision,
  });

  const theme = createTheme({
    theme: 'light',
    settings: {
      background: editable ? '#fff' : Colors['greyscale-grey2'].hex(),
      foreground: '#24292e',
      selection: '#BBDFFF',
      selectionMatch: '#BBDFFF',
      gutterBackground: '#fff',
      gutterForeground: '#6e7781',
    },
    styles: [
      { tag: [t.comment, t.bracket], color: '#6a737d' },
      { tag: [t.className, t.propertyName], color: '#6f42c1' },
      {
        tag: [t.variableName, t.attributeName, t.number, t.operator],
        color: '#005cc5',
      },
      {
        tag: [t.keyword, t.typeName, t.typeOperator, t.typeName],
        color: '#d73a49',
      },
      { tag: [t.string, t.meta, t.regexp], color: '#032f62' },
      { tag: [t.name, t.quote], color: '#22863a' },
      { tag: [t.heading], color: '#24292e', fontWeight: 'bold' },
      { tag: [t.emphasis], color: '#24292e', fontStyle: 'italic' },
      { tag: [t.deleted], color: '#b31d28', backgroundColor: 'ffeef0' },
    ],
  });

  return (
    <>
      <ConfigurationErrorFeedback error={error} />
      {isSuccess && (
        <StyledReactCodeMirror
          editable={editable}
          readOnly={!editable}
          basicSetup={true}
          extensions={[StreamLanguage.define(yaml)]}
          value={configuration?.config || ''}
          lang="yaml"
          theme={theme}
          onChange={onChange}
        />
      )}
    </>
  );
}

const StyledReactCodeMirror = styled(ReactCodeMirror)`
  min-height: 500px;
  .cm-gutter {
    background-color: ${Colors['greyscale-grey2'].hex()};
  }
`;
