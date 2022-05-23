import reducer, {
  addExplorerUploadedFileId,
  explorerReducerInitialState,
  resetExplorerTemporaryState,
  setDefaultTimestampKey,
  setExplorerFiles,
  setExplorerFileSelectState,
  setExplorerFileUploadModalVisibility,
  setExplorerFilter,
  setExplorerModalFocusedFileId,
  setExplorerModalQueryString,
  setExplorerQueryString,
  setExplorerSelectedFiles,
  setLoadingAnnotations,
  setPercentageScanned,
  setSelectedAllExplorerFiles,
  toggleExplorerFilterView,
} from 'src/modules/Explorer/store/slice';
import { ExplorerState } from 'src/modules/Explorer/types';
import { clearExplorerFileState } from 'src/store/commonActions';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { VisionFilesToFileState } from 'src/store/util/StateUtils';
import { mockFileList } from 'src/__test-utils/fixtures/files';

describe('Test explorer reducers', () => {
  test('should return the initial state for undefined state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(
      explorerReducerInitialState
    );
  });
  const fileIds = [1, 2, 3];
  const mockState: ExplorerState = {
    ...explorerReducerInitialState,
    filter: {
      directoryPrefix: 'prefix',
    },
    showFileUploadModal: false,
    percentageScanned: 0,
    loadingAnnotations: false,
    showFilter: false,
    exploreModal: {
      filter: {},
      focusedFileId: 1,
      query: 'foo',
    },
    query: 'foo',
    uploadedFileIds: [1, 2, 3],
    sortMeta: {
      sortKey: 'test',
      currentPage: 1337,
      pageSize: 123,
      defaultTimestampKey: 'timestamp',
    },
    focusedFileId: 1,
    files: {
      byId: VisionFilesToFileState(
        mockFileList.filter((file) => fileIds.includes(file.id))
      ),
      allIds: [1, 2, 3],
      selectedIds: [1, 2],
    },
  };
  describe('action setExplorerFileSelectState', () => {
    test('should deselect an already selected file', () => {
      expect(
        reducer(
          mockState,
          setExplorerFileSelectState({ fileId: 1, selected: true })
        ).files.selectedIds
      ).toEqual([2]);
    });
    test('should select new item', () => {
      expect(
        reducer(
          mockState,
          setExplorerFileSelectState({ fileId: 3, selected: true })
        ).files.selectedIds
      ).toEqual([1, 2, 3]);
    });
  });
  describe('action setExplorerSelectedFiles', () => {
    test('should change selectedIds', () => {
      expect(
        reducer(mockState, setExplorerSelectedFiles([1, 2])).files.selectedIds
      ).toEqual([1, 2]);
    });
  });
  describe('action setExplorermodalFocusedFileId', () => {
    test('should set new focus file id', () => {
      expect(
        reducer(mockState, setExplorerModalFocusedFileId(1)).exploreModal
          .focusedFileId
      ).toEqual(1);
    });
    test('should unset focus file id', () => {
      expect(
        reducer(mockState, setExplorerModalFocusedFileId(null)).exploreModal
          .focusedFileId
      ).toEqual(null);
    });
  });
  describe('action setExplorerQueryString', () => {
    test('should set new state query', () => {
      const newState = reducer(mockState, setExplorerQueryString('foo'));
      expect(newState.query).toEqual('foo');
      expect(newState.sortMeta.sortKey).toEqual('test');
      expect(newState.sortMeta.currentPage).toEqual(1337);
    });
    test('should reset sort pagination on query change', () => {
      const newState = reducer(mockState, setExplorerQueryString('bar'));
      expect(newState.sortMeta.sortKey).toEqual('');
      expect(newState.sortMeta.currentPage).toEqual(1);
    });
  });
  describe('action setExplorerModalQueryString', () => {
    test('should set new explore modal query', () => {
      const newState = reducer(mockState, setExplorerModalQueryString('foo'));
      expect(newState.exploreModal.query).toEqual('foo');
      expect(newState.sortMeta.sortKey).toEqual('test');
      expect(newState.sortMeta.currentPage).toEqual(1337);
    });
    test('should reset sort pagination on explore modal query change', () => {
      const newState = reducer(mockState, setExplorerModalQueryString('bar'));
      expect(newState.sortMeta.sortKey).toEqual('');
      expect(newState.sortMeta.currentPage).toEqual(1);
    });
  });
  describe('action setExplorerFilter', () => {
    test('should reset sort pagination on filter change', () => {
      const newState = reducer(
        mockState,
        setExplorerFilter({ directoryPrefix: 'bar' })
      );
      expect(newState.filter.directoryPrefix).toEqual('bar');
      // should reset sort pagination
      expect(newState.sortMeta.sortKey).toEqual('');
      expect(newState.sortMeta.currentPage).toEqual(1);
    });
    test('Setting same filter should not reset sort pagination', () => {
      const newState = reducer(
        mockState,
        setExplorerFilter({ directoryPrefix: 'prefix' })
      );
      expect(newState.filter.directoryPrefix).toEqual('prefix');
      // should not reset sort pagination
      expect(newState.sortMeta.sortKey).toEqual('test');
      expect(newState.sortMeta.currentPage).toEqual(1337);
    });
  });
  describe('action toggleExplorerFilterView', () => {
    test('should toggle showFilter', () => {
      expect(reducer(mockState, toggleExplorerFilterView()).showFilter).toEqual(
        true
      );
    });
  });
  describe('action setExplorerFileUploadModalVisibility', () => {
    test('should set showFileUploadModel', () => {
      expect(
        reducer(mockState, setExplorerFileUploadModalVisibility(true))
          .showFileUploadModal
      ).toEqual(true);
    });
  });
  describe('action setLoadingAnnotations', () => {
    test('should set loadingAnnotations to true', () => {
      expect(
        reducer(mockState, setLoadingAnnotations()).loadingAnnotations
      ).toEqual(true);
    });
  });
  describe('action addExplorerUploadedFileId', () => {
    test('should have added new uploaded file id', () => {
      expect(
        reducer(mockState, addExplorerUploadedFileId(4)).uploadedFileIds
      ).toEqual([1, 2, 3, 4]);
    });
  });
  describe('action resetExplorerTemporaryState', () => {
    test('should reset file state', () => {
      const newState = reducer(mockState, resetExplorerTemporaryState());
      expect(newState.uploadedFileIds).toEqual([]);
      expect(newState.showFileUploadModal).toEqual(false);
      expect(newState.loadingAnnotations).toEqual(false);
      expect(newState.files).toEqual({ byId: {}, allIds: [], selectedIds: [] });
    });
  });
  describe('action setPercentageScanned', () => {
    test('should set percentageScenned', () => {
      expect(
        reducer(mockState, setPercentageScanned(100)).percentageScanned
      ).toEqual(100);
    });
  });
  describe('action setDefaultTimestampKey', () => {
    test('should set defaultTimestampkey', () => {
      expect(
        reducer(mockState, setDefaultTimestampKey('foo')).sortMeta
          .defaultTimestampKey
      ).toEqual('foo');
    });
  });

  describe('Test extra reducers', () => {
    test('action setExplorerFiles', () => {
      const payloadFileIds = [1, 2, 4];
      const action = {
        type: setExplorerFiles.type,
        payload: Object.values(
          VisionFilesToFileState(
            mockFileList.filter((file) => payloadFileIds.includes(file.id))
          )
        ),
      };
      const newState = reducer(mockState, action);
      expect(Object.keys(newState.files.byId)).toEqual(['1', '2', '4']);
      expect(newState.files.allIds).toEqual([1, 2, 4]);
      expect(newState.files.selectedIds).toEqual([]);
    });

    test('action UpdateFiles.fulfilled', () => {
      const action = {
        type: UpdateFiles.fulfilled,
        payload: [
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
          { id: 4, name: 'c' },
        ],
      };
      const newState = reducer(mockState, action);
      expect(Object.keys(newState.files.byId)).toEqual(['1', '2', '3', '4']);
      expect(newState.files.allIds).toEqual([1, 2, 3, 4]);
      expect(newState.files.selectedIds).toEqual([1, 2]);
      // The name of the third file should remain the same
      expect(Object.values(newState.files.byId).map((val) => val.name)).toEqual(
        ['a', 'b', 'three', 'c']
      );
    });

    describe('action setSelectedAllExplorerFiles', () => {
      test('selectStatus=true without filter', () => {
        const action = {
          type: setSelectedAllExplorerFiles.type,
          payload: {
            selectStatus: true,
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.files.allIds).toEqual([1, 2, 3]);
        expect(newState.files.selectedIds).toEqual([1, 2, 3]);
      });
      test('selectStatus=false without filter', () => {
        const action = {
          type: setSelectedAllExplorerFiles.type,
          payload: {
            selectStatus: false,
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.files.allIds).toEqual([1, 2, 3]);
        expect(newState.files.selectedIds).toEqual([]);
      });

      test('selectStatus=true with SelectFilter', () => {
        const action = {
          type: setSelectedAllExplorerFiles.type,
          payload: {
            selectStatus: true,
            filter: { geoLocation: true },
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.files.allIds).toEqual([1, 2, 3]);
        // Mock files with ids 1 and 2 have geo locations
        expect(newState.files.selectedIds).toEqual([1, 2]);
      });
      test('selectStatus=false with SelectFilter', () => {
        const action = {
          type: setSelectedAllExplorerFiles.type,
          payload: {
            selectStatus: false,
            filter: { geoLocation: true },
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.files.allIds).toEqual([1, 2, 3]);
        // Mock files with ids 1 and 2 have geo locations
        expect(newState.files.selectedIds).toEqual([]);
      });
    });

    test('action RetrieveAnnotationsV1.fulfilled', () => {
      const action = {
        type: RetrieveAnnotationsV1.fulfilled,
        payload: {},
      };
      const newState = reducer(mockState, action);
      expect(newState.loadingAnnotations).toEqual(false);
    });

    test('action DeleteFilesById.fulfilled on focused file id', () => {
      const action = {
        type: DeleteFilesById.fulfilled,
        payload: [1, 2, 3],
      };
      const newState = reducer(mockState, action);
      expect(newState.focusedFileId).toEqual(null);
    });
    test('action DeleteFilesById.fulfilled on non-focused file id', () => {
      const action = {
        type: DeleteFilesById.fulfilled,
        payload: [4, 5],
      };
      const newState = reducer(mockState, action);
      expect(newState.focusedFileId).toEqual(1);
    });

    const actionTypes = [
      DeleteFilesById.fulfilled.type,
      clearExplorerFileState.type,
    ];
    test('Should clear file state', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: [1, 2],
        };
        const newState = reducer(mockState, action);
        expect(newState.uploadedFileIds).toEqual([3]);
        expect(newState.files.selectedIds).toEqual([]);
        expect(newState.files.allIds).toEqual([3]);
        expect(Object.keys(newState.files.byId)).toEqual(['3']);
      });
    });
  });
});
