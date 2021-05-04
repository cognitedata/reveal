import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { useDispatch } from 'react-redux';
import {
  fileMetaDataAddRow,
  toggleMetaDataTableEditMode,
} from '../../fileDetailsSlice';

const TableToolBar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
`;

const StyledButton = styled(Button)`
  margin-left: 15px;
`;

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
      <StyledButton type="ghost" icon="Plus" onClick={handleAddMetadataRow}>
        Add row
      </StyledButton>
      <StyledButton
        type="ghost"
        disabled={!metadata.length}
        icon={editMode ? 'Checkmark' : 'Edit'}
        onClick={handleEditModeChange}
      >
        {editMode ? 'Finish Editing' : 'Edit table'}
      </StyledButton>
    </TableToolBar>
  );
};
