import { FileDetailsState } from 'src/modules/FileDetails/types';
import {
  metadataEditMode,
  editedFileDetails,
  editedFileMeta,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from 'src/modules/FileDetails/selectors';
import { FileState } from 'src/modules/Common/store/files/types';
import { createFileState } from 'src/store/util/StateUtils';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { RootState } from 'src/store/rootReducer';

describe('Test file details selectors', () => {
  const mockState: FileDetailsState = {
    metadataEdit: true,
    fileDetails: {
      labels: [{ externalId: 'testlabel' }],
      source: 'newsource',
      mimeType: 'image/jpeg',
      assetIds: [1, 2, 3],
      directory: '/foo/bar',
    },
    fileMetaData: { 0: { key: 'foo', value: 'bar' } },
    loadingField: 'labels',
  };
  test('metadataEditMode', () => {
    expect(metadataEditMode(mockState)).toEqual(mockState.metadataEdit);
  });
  test('editedFileDetails', () => {
    expect(editedFileDetails(mockState)).toEqual(mockState.fileDetails);
  });
  test('editedFileMeta', () => {
    expect(editedFileMeta(mockState)).toEqual(mockState.fileMetaData);
  });

  const filesState: FileState = {
    files: {
      allIds: [0, 1],
      byId: {
        0: createFileState(mockFileList[0]),
        1: createFileState(mockFileList[1]),
      },
      selectedIds: [0],
    },
  };
  const rootState: RootState = {
    fileDetailsSlice: mockState,
    fileReducer: filesState,
  } as RootState;
  describe('selectUpdatedFileDetails', () => {
    test('should modify existing file', () => {
      const updatedFile = selectUpdatedFileDetails(rootState, 0);
      expect(updatedFile).toBeTruthy(); // updatedFile should not be null
      expect(updatedFile!.id).toEqual(1);
      expect(updatedFile).toEqual(
        expect.objectContaining({ ...mockState.fileDetails })
      );
    });
    test('should return null if updating non-existing file', () => {
      const updatedFile = selectUpdatedFileDetails(rootState, 2);
      expect(updatedFile).toEqual(null);
    });
    test('should return original file info if updated file details are empty', () => {
      const rootStateWithEmptyFileDetails: RootState = {
        fileDetailsSlice: {
          ...mockState,
          fileDetails: {},
        },
        fileReducer: filesState,
      } as RootState;
      const updatedFile = selectUpdatedFileDetails(
        rootStateWithEmptyFileDetails,
        0
      );
      expect(updatedFile).toEqual(
        expect.objectContaining({ ...mockFileList[0] })
      );
    });
  });
  describe('selectUpdatedFileMeta', () => {
    test('should return updated metadata if file details state has one', () => {
      expect(selectUpdatedFileMeta(rootState, 0)).toEqual([
        { key: 'foo', value: 'bar' },
      ]);
    });
    test('should return the metadata of the file info if no update', () => {
      const newRootState: RootState = {
        fileDetailsSlice: {
          ...mockState,
          fileMetaData: {},
        },
        fileReducer: filesState,
      } as RootState;
      expect(selectUpdatedFileMeta(newRootState, 0)).toEqual([]);
    });
    test('should return edited metadata for non existing file', () => {
      expect(selectUpdatedFileMeta(rootState, 1234)).toEqual([
        { key: 'foo', value: 'bar' },
      ]);
    });
  });
});
