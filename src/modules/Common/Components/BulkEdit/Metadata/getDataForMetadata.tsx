import React from 'react';
import { EditPanelState } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditTempState } from 'src/modules/Common/store/commonSlice';
import { FileState } from 'src/modules/Common/store/filesSlice';
import styled from 'styled-components';

export const getDataForMetadata = (
  selectedFiles: FileState[],
  bulkEditTemp: BulkEditTempState,
  editPanelState: EditPanelState
): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, metadata } = file;
    const { value: activeKey } = editPanelState.metadataActiveKey || {
      value: '',
    };
    const originalValue = metadata ? metadata[activeKey] || '---' : '';

    const { metadata: newMetadata } = bulkEditTemp;
    const updatedValue = newMetadata ? newMetadata[activeKey] : '';

    return {
      name,
      original: metadata ? (
        <CellContainer>{originalValue}</CellContainer>
      ) : (
        <></>
      ),
      updated: newMetadata ? (
        <CellContainer>{updatedValue}</CellContainer>
      ) : (
        <></>
      ),
    };
  });
};

const CellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
`;
