import React from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../../store';
import { fileMetaDataAddRow, toggleMetaDataTableEditMode } from '../../slice';

import { MetadataItem } from './Types';

export const MetadataTableToolBar = ({
  editMode,
  metadata,
  onAddRow,
  onEditModeChange,
}: {
  editMode: boolean;
  metadata: MetadataItem[];
  onAddRow?: () => void;
  onEditModeChange: (mode: boolean) => void;
}) => {
  const dispatch = useThunkDispatch();

  const handleEditModeChange = () => {
    dispatch(toggleMetaDataTableEditMode(metadata));
    onEditModeChange(editMode);
  };

  const handleAddMetadataRow = () => {
    dispatch(fileMetaDataAddRow(metadata));
    if (onAddRow) {
      onAddRow();
    }
  };

  return (
    <TableToolBar>
      <Button
        type="tertiary"
        disabled={!metadata.length}
        icon={editMode ? 'Checkmark' : 'Edit'}
        onClick={handleEditModeChange}
      >
        {editMode ? 'Finish Editing' : 'Edit table'}
      </Button>
      <Button type="tertiary" icon="Add" onClick={handleAddMetadataRow}>
        Add row
      </Button>
    </TableToolBar>
  );
};

const TableToolBar = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 5px;
`;
