import reducer, {
  addFiles,
  clearState,
  initialState,
  setFileSelectState,
} from 'src/modules/Common/store/files/slice';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import {
  createFileState,
  VisionFilesToFileState,
} from 'src/store/util/StateUtils';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';

describe('Test files reducer', () => {
  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle a file being added to initial state', () => {
    expect(
      reducer(
        undefined,
        addFiles(mockFileList.map((item) => createFileState(item)))
      ).files
    ).toEqual({
      byId: VisionFilesToFileState(mockFileList),
      allIds: mockFileList.map((item) => item.id),
      selectedIds: [],
    });
  });

  test('should not add an existing file to state', () => {
    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState([...mockFileList.slice(0, 1)]),
        allIds: [...mockFileList.slice(0, 1)].map((item) => item.id),
        selectedIds: [],
      },
    };

    expect(
      reducer(
        previousState,
        addFiles(mockFileList.map((item) => createFileState(item)))
      ).files
    ).toEqual({
      byId: VisionFilesToFileState(mockFileList),
      allIds: mockFileList.map((item) => item.id),
      selectedIds: [],
    });
  });

  test('should add selected file to selectedIds list', () => {
    const selectedIds = [1];
    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState(mockFileList),
        allIds: mockFileList.map((item) => item.id),
        selectedIds,
      },
    };
    expect(
      reducer(previousState, setFileSelectState(2, selectedIds.includes(2)))
        .files.selectedIds
    ).toEqual([1, 2]);
  });

  test('should remove already selected file from selectedIds list', () => {
    const selectedIds = [1];

    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState(mockFileList),
        allIds: mockFileList.map((item) => item.id),
        selectedIds,
      },
    };
    expect(
      reducer(previousState, setFileSelectState(1, selectedIds.includes(1)))
        .files.selectedIds
    ).toEqual([]);
  });

  test('should remove specified file from the state', () => {
    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState(mockFileList),
        allIds: mockFileList.map((item) => item.id),
        selectedIds: [1, 2],
      },
    };
    expect(
      reducer(
        previousState,
        clearState(
          mockFileList.filter((item) => item.id > 1).map((item) => item.id)
        )
      )
    ).toEqual({
      ...initialState,
      files: {
        byId: VisionFilesToFileState([...mockFileList.slice(0, 1)]),
        allIds: [...mockFileList.slice(0, 1)].map((item) => item.id),
        selectedIds: [1],
      },
    });
  });

  test('should clear the entire state if no ids provided', () => {
    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState(mockFileList),
        allIds: mockFileList.map((item) => item.id),
        selectedIds: [1, 2],
      },
    };
    expect(reducer(previousState, clearState([]))).toEqual(initialState);
  });

  test('should remove files from state when file delete thunk is fullfilled', () => {
    const previousState = {
      ...initialState,
      files: {
        byId: VisionFilesToFileState(mockFileList),
        allIds: mockFileList.map((item) => item.id),
        selectedIds: [1, 2],
      },
    };

    const deletedFileId = 1;
    const action = {
      type: DeleteFilesById.fulfilled.type,
      payload: [deletedFileId],
    };
    expect(reducer(previousState, action)).toEqual({
      dataSetIds: undefined,
      extractExif: true,
      files: {
        byId: VisionFilesToFileState([...mockFileList.slice(1)]),
        allIds: [...mockFileList.slice(1)].map((item) => item.id),
        selectedIds: [2],
      },
    });
  });
});
