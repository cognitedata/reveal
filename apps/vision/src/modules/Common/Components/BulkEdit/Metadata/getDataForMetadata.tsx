import React from 'react';

import { BulkEditUnsavedState } from '../../../store/common/types';
import { VisionFile } from '../../../store/files/types';
import { EditPanelState } from '../bulkEditOptions';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';
import { CellContainer } from '../utils/CellContainer';

export const getDataForMetadata = ({
  selectedFiles,
  bulkEditUnsaved,
  editPanelState,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
  editPanelState: EditPanelState;
}): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, id, metadata } = file;
    const { value: activeKey } = editPanelState.metadataActiveKey || {
      value: '',
    };
    const originalValue = metadata ? metadata[activeKey] || '---' : '';

    const { metadata: newMetadata } = bulkEditUnsaved;
    const updatedValue = newMetadata ? newMetadata[activeKey] : '';

    return {
      name,
      id,
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
