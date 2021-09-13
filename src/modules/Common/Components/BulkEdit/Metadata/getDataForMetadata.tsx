import React from 'react';
import styled from 'styled-components';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { FileState } from 'src/modules/Common/filesSlice';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';
import { EditPanelState } from '../bulkEditOptions';

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
