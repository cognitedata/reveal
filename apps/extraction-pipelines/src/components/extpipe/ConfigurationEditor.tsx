import React from 'react';

import { StreamLanguage } from '@codemirror/language';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { useExtpipeConfig } from '@extraction-pipelines/hooks/config';

import { CodeEditor, CodeSnippet } from '@cognite/cdf-utilities';

import ConfigurationErrorFeedback from './ConfigurationError';

type Props = {
  externalId: string;
  revision?: number;
  editable?: boolean;
  onChange?: (s: string) => void;
  isSnippet?: boolean;
  onCreate?: () => void;
};
export default function ConfigurationEditor({
  externalId,
  revision,
  editable = false,
  onChange,
  isSnippet,
  onCreate,
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
    <div>
      {!editable && (
        <ConfigurationErrorFeedback error={error} onCreate={onCreate} />
      )}
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
    </div>
  );
}
