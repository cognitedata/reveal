import React from 'react';
import {
  fileMetaDataAddRow,
  toggleMetaDataTableEditMode,
} from 'src/modules/FileDetails/slice';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { useDispatch } from 'react-redux';

const StyledButton = styled(Button)``;

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
  const dispatch = useDispatch();

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
      <StyledButton
        type="ghost"
        disabled={!metadata.length}
        icon={editMode ? 'Checkmark' : 'Edit'}
        onClick={handleEditModeChange}
      >
        {editMode ? 'Finish Editing' : 'Edit table'}
      </StyledButton>
      <StyledButton type="ghost" icon="Add" onClick={handleAddMetadataRow}>
        Add row
      </StyledButton>
    </TableToolBar>
  );
};

const TableToolBar = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 5px;
`;
