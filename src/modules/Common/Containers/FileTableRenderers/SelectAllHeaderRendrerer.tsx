import { CellRenderer } from 'src/modules/Common/Types';
import React from 'react';
import {
  selectAllFilesSelected,
  setAllFilesSelectState,
} from 'src/modules/Upload/uploadedFilesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Checkbox } from '@cognite/cogs.js';

export function SelectAllHeaderRenderer({ column }: CellRenderer) {
  const dispatch = useDispatch();
  const allFilesSelected = useSelector((state: RootState) =>
    selectAllFilesSelected(state.uploadedFiles)
  );

  const handleSelectAllFiles = () => {
    dispatch(setAllFilesSelectState(!allFilesSelected));
  };
  return (
    <Checkbox
      className="cogs-body-2"
      name="select-all-files"
      value={allFilesSelected}
      onChange={handleSelectAllFiles}
      style={{ color: '#8c8c8c', fontSize: 10 }}
    >
      {column.title}
    </Checkbox>
  );
}
