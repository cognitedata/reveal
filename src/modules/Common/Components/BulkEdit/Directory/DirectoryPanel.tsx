import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Body, Button, Tooltip } from '@cognite/cogs.js';
import { EditPanelProps } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { validateDirectoryPrefix } from 'src/modules/Common/Components/BulkEdit/Directory/validateDirectoryPrefix';
import { Input } from 'antd';

export const DirectoryPanel = ({
  bulkEditUnsaved,
  setBulkEditUnsaved,
}: EditPanelProps): JSX.Element => {
  /**
   * if unsaved directory undefined: nothing will be changed
   * if unsaved directory '': directory will be removed
   * if unsaved directory defined: directory update with the new value
   */
  const { directory } = bulkEditUnsaved;
  const [newDirectory, setNewDirectory] =
    useState<string | undefined>(directory);
  const validDirectoryPrefix = useMemo(
    () =>
      validateDirectoryPrefix({
        directory: newDirectory,
      }),
    [newDirectory]
  );

  return (
    <PanelContainer>
      <InputContainer>
        <Body level={2}>Directory</Body>
        <Input
          value={newDirectory}
          onChange={(event) => {
            const { value } = event.target;
            setNewDirectory(value);
          }}
        />
      </InputContainer>
      <Tooltip
        content={<span>{validDirectoryPrefix}</span>}
        disabled={!validDirectoryPrefix}
      >
        <Button
          type="secondary"
          onClick={() => {
            setBulkEditUnsaved({
              ...bulkEditUnsaved,
              directory: newDirectory || '',
            });
          }}
          disabled={!!validDirectoryPrefix}
        >
          Update
        </Button>
      </Tooltip>

      <Button
        type="tertiary"
        onClick={() => {
          setBulkEditUnsaved({
            ...bulkEditUnsaved,
            directory: undefined,
          });
          setNewDirectory('');
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
