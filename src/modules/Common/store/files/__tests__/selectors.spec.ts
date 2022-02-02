import { selectAllFilesSelected } from 'src/modules/Common/store/files/selectors';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { VisionFilesToFileState } from 'src/store/util/StateUtils';

describe('Test files reducer', () => {
  test('should return true since all files are selected', () => {
    const fileIds = [1, 2];

    const previousState = {
      dataSetIds: undefined,
      extractExif: true,
      files: {
        byId: VisionFilesToFileState(
          mockFileList.filter((file) => fileIds.includes(file.id))
        ),
        allIds: fileIds,
        selectedIds: fileIds,
      },
    };
    expect(selectAllFilesSelected(previousState)).toEqual(true);
  });

  test('should return false since not all files are selected', () => {
    const fileIds = [1, 2];

    const previousState = {
      dataSetIds: undefined,
      extractExif: true,
      files: {
        byId: VisionFilesToFileState(
          mockFileList.filter((file) => fileIds.includes(file.id))
        ),
        allIds: fileIds,
        selectedIds: fileIds.slice(0, 1),
      },
    };
    expect(selectAllFilesSelected(previousState)).toEqual(false);
  });
});
