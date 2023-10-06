import { BulkEditUnsavedState } from '../../../store/common/types';
import { VisionFile } from '../../../store/files/types';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';
import { getOriginalValue } from '../utils/getOriginalValue';
import { getUpdatedValue } from '../utils/getUpdatedValue';

export const getDataForDirectory = ({
  selectedFiles,
  bulkEditUnsaved,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
}): BulkEditTableDataType[] => {
  const { directory: newDirectory } = bulkEditUnsaved;

  return selectedFiles.map((file) => {
    const { name, directory } = file;

    return {
      name,
      original: getOriginalValue({ originalValue: directory }),
      updated: getUpdatedValue({
        originalValue: directory,
        newValue: newDirectory,
      }),
    };
  });
};
