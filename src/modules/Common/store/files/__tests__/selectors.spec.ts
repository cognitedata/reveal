import { selectAllFilesSelected } from 'src/modules/Common/store/files/selectors';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { VisionFilesToFileState } from 'src/store/util/StateUtils';

describe('Test files reducer', () => {
  const fileIds = [1, 2];
  // Test for different args. We set files.allIds and overridedFileIds to be the
  // same, so the results with and without overridedFileIds should be the same.
  const args = [{}, { overridedFileIds: fileIds }];
  args.forEach((arg) => {
    test(`should return true since all files are selected, overrided ids: ${arg.overridedFileIds}`, () => {
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
      expect(selectAllFilesSelected(previousState, arg)).toEqual(true);
    });

    test(`should return false since not all files are selected, overrided ids: ${arg.overridedFileIds}`, () => {
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
      expect(selectAllFilesSelected(previousState, arg)).toEqual(false);
    });
  });
  test('should return true since all overrided ids are selected', () => {
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
    expect(
      selectAllFilesSelected(previousState, {
        overridedFileIds: fileIds.slice(0, 1),
      })
    ).toEqual(true);
  });
});
