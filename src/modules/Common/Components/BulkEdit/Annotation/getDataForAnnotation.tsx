import { EditPanelState } from 'src/modules/Common/Components/BulkEdit/bulkEditOptions';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';

export const getDataForAnnotation = (
  selectedFiles: VisionFile[],
  bulkEditUnsavedState: BulkEditUnsavedState,
  editPanelState: EditPanelState
): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, id } = file;
    return {
      name,
      id,
      annotationFilter: editPanelState.annotationFilterType,
    };
  });
};
