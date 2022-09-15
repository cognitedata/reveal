import React from 'react';
import { useExtpipeConfig } from 'hooks/config';
import { StreamLanguage } from '@codemirror/language';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import ConfigurationErrorFeedback from './ConfigurationError';
import { CodeEditor, CodeSnippet } from '@cognite/cdf-utilities';

type Props = {
  externalId: string;
  revision?: number;
  editable?: boolean;
  onChange?: (s: string) => void;
  isSnippet?: boolean;
};
export default function ConfigurationEditor({
  externalId,
  revision,
  editable = false,
  onChange,
  isSnippet,
}: Props) {
  const {
    data: configuration,
    isSuccess,
    error,
  } = useExtpipeConfig({
    externalId,
    revision,
  });

  return (
    <>
      {!editable && <ConfigurationErrorFeedback error={error} />}
      {(isSuccess || editable) &&
        (isSnippet ? (
          <CodeSnippet
            extensions={[StreamLanguage.define(yaml)]}
            lang="yaml"
            value={configuration?.config || ''}
          />
        ) : (
          <CodeEditor
            disabled={!editable}
            extensions={[StreamLanguage.define(yaml)]}
            onChange={onChange}
            lang="yaml"
            value={configuration?.config || ''}
          />
        ))}
    </>
  );
}
