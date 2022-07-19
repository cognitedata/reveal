import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { getOriginalValue } from 'src/modules/Common/Components/BulkEdit/utils/getOriginalValue';
import { getUpdatedValue } from 'src/modules/Common/Components/BulkEdit/utils/getUpdatedValue';

export const getDataForSource = ({
  selectedFiles,
  bulkEditUnsaved,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
}): BulkEditTableDataType[] => {
  const { source: newSource } = bulkEditUnsaved;

  return selectedFiles.map((file) => {
    const { name, source } = file;

    return {
      name,
      original: getOriginalValue({ originalValue: source }),
      updated: getUpdatedValue({ originalValue: source, newValue: newSource }),
    };
  });
};
