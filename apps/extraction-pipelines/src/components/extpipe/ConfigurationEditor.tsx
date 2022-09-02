import React from 'react';
import styled from 'styled-components';
import { useExtpipeConfig } from 'hooks/config';
import { StreamLanguage } from '@codemirror/language';
import ReactCodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import ConfigurationErrorFeedback from './ConfigurationError';

type Props = { externalId: string };
export default function ConfigurationEditor({ externalId }: Props) {
  const {
    data: configuration,
    isSuccess,
    error,
  } = useExtpipeConfig({
    externalId,
  });
  return (
    <>
      <ConfigurationErrorFeedback error={error} />
      {isSuccess && (
        <StyledReactCodeMirror
          editable={false}
          readOnly={true}
          basicSetup={true}
          extensions={[StreamLanguage.define(yaml)]}
          value={configuration?.config || ''}
          lang="yaml"
        />
      )}
    </>
  );
}

const StyledReactCodeMirror = styled(ReactCodeMirror)`
  margin: 0 10px;
  min-height: 500px;
`;
