import React from 'react';
import { EditPanelState } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { CellContainer } from 'src/modules/Common/Components/BulkEdit/utils/CellContainer';

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
