import React from 'react';
import { EditPanelState } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';

export const getDataForMetadata = (
  selectedFiles: VisionFile[],
  bulkEditUnsaved: BulkEditUnsavedState,
  editPanelState: EditPanelState
): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, metadata } = file;
    const { value: activeKey } = editPanelState.metadataActiveKey || {
      value: '',
    };
    const originalValue = metadata ? metadata[activeKey] || '---' : '';

    const { metadata: newMetadata } = bulkEditUnsaved;
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
