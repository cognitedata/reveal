import { BulkEditUnsavedState } from '../../../store/common/types';
import { VisionFile } from '../../../store/files/types';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';
import { getOriginalValue } from '../utils/getOriginalValue';
import { getUpdatedValue } from '../utils/getUpdatedValue';

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
