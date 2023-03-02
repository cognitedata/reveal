import React, { useState } from 'react';
import styled from 'styled-components';
import { Body, Button } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { Input } from 'antd';

export const SourcePanel = ({
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: EditPanelProps): JSX.Element => {
  /**
   * if unsaved source undefined: nothing will be changed
   * if unsaved source '': source will be removed
   * if unsaved source defined: source update with the new value
   */
  const { source } = bulkEditUnsaved;
  const [newSource, setNewSource] = useState<string | undefined>(source);

  return (
    <PanelContainer>
      <InputContainer>
        <Body level={2}>Source</Body>
        <Input
          value={newSource}
          onChange={(event) => {
            const { value } = event.target;
            setNewSource(value);
          }}
        />
      </InputContainer>
      <Button
        type="secondary"
        onClick={() => {
          setBulkEditUnsaved({
            ...bulkEditUnsaved,
            source: newSource || '',
          });
        }}
      >
        Update
      </Button>
      <Button
        type="tertiary"
        onClick={() => {
          setBulkEditUnsaved({
            ...bulkEditUnsaved,
            source: undefined,
          });
          setNewSource('');
        }}
      >
        Reset
      </Button>
    </PanelContainer>
  );
};

const PanelContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: left;
  align-items: end;
  grid-gap: 8px;
`;

const InputContainer = styled.div`
  display: grid;
  grid-gap: 6px;
  width: 500px;
`;
