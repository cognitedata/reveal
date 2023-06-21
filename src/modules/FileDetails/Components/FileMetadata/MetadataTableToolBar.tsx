import React from 'react';
import {
  fileMetaDataAddRow,
  toggleMetaDataTableEditMode,
} from 'src/modules/FileDetails/slice';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { useDispatch } from 'react-redux';

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
