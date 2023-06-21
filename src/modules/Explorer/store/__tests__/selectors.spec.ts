import { SortKeys } from 'src/modules/Common/Utils/SortUtils';
import {
  selectExplorerSelectedIds,
  selectExploreFileCount,
  selectExplorerAllFiles,
  selectExplorerAllFilesSelected,
  selectExplorerFilesWithAnnotationCount,
  selectExplorerSortedFiles,
  selectExplorerSelectedFileIdsInSortedOrder,
  selectExplorerAllSelectedFilesInSortedOrder,
} from 'src/modules/Explorer/store/selectors';
import { ExplorerState } from 'src/modules/Explorer/types';
import { RootState } from 'src/store/rootReducer';
import { VisionFilesToFileState } from 'src/store/util/StateUtils';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import {
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageObjectDetectionPolygonAnnotation,
  getDummyImageObjectDetectionPolylineAnnotation,
} from 'src/__test-utils/getDummyAnnotations';

describe('Test file explorer selectors', () => {
  const mockState: ExplorerState = {
    focusedFileId: null,
    showFileMetadata: false,
    currentView: 'list',
    mapTableTabKey: 'fileInMap',
    sortMeta: {
      sortKey: SortKeys.annotations,
      reverse: false,
      currentPage: 1,
      pageSize: 123,
      defaultTimestampKey: '',
    },
    isLoading: false,
    query: '',
    filter: {},
    showFilter: true,
    showFileUploadModal: false,
    files: {
      byId: {},
      allIds: [],
      selectedIds: [],
    },
    uploadedFileIds: [],
    loadingAnnotations: false,
    exploreModal: {
      filter: {},
      query: '',
      focusedFileId: null,
    },
    percentageScanned: 0,
  };

  test('selectExplorerSelectedIds', () => {
    expect(selectExplorerSelectedIds(mockState)).toEqual(
      mockState.files.selectedIds
    );
  });
  test('selectExploreFileCount', () => {
    expect(selectExploreFileCount(mockState)).toEqual(
      mockState.files.allIds.length
    );
  });

  describe('Test selectExplorerAllFiles', () => {
    test('Return empty list if no files are available', () => {
      expect(selectExplorerAllFiles(mockState)).toEqual([]);
    });

    test('Return all available files', () => {
      const fileIds = [1, 2];
      const testState = {
        ...mockState,
        files: {
          byId: VisionFilesToFileState(
            mockFileList.filter((file) => fileIds.includes(file.id))
          ),
          allIds: [1, 2],
          selectedIds: [],
        },
      };
      const selectedFiles = selectExplorerAllFiles(testState);
      const ids = selectedFiles.map((item) => item.id);
      expect(ids).toEqual([1, 2]);
    });
  });

  describe('Test selectExplorerAllFilesSelected', () => {
    test('Return false if no files are available', () => {
      expect(selectExplorerAllFilesSelected(mockState)).toEqual(false);
    });
    const fileIds = [1, 2];
    const testState = {
      ...mockState,
      files: {
        byId: VisionFilesToFileState(
          mockFileList.filter((file) => fileIds.includes(file.id))
        ),
        allIds: [1, 2],
        selectedIds: [1, 2],
      },
    };
    test('Return true if all files are selected', () => {
      expect(selectExplorerAllFilesSelected(testState)).toEqual(true);
    });
    test('Return false if not all files are selected', () => {
      const testState2 = {
        ...testState,
        files: {
          byId: VisionFilesToFileState(
            mockFileList.filter((file) => fileIds.includes(file.id))
          ),
          allIds: [1, 2],
          selectedIds: [1],
        },
      };
      expect(selectExplorerAllFilesSelected(testState2)).toEqual(false);
    });
  });

  const annoState: AnnotationState = {
    files: {
      byId: { 1: [1, 2], 2: [], 4: [4] },
    },
    annotations: {
      byId: {
        1: getDummyImageObjectDetectionPolygonAnnotation({
          id: 1,
          annotatedResourceId: 1,
        }),
        2: getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 2,
          annotatedResourceId: 1,
        }),
        4: getDummyImageObjectDetectionPolylineAnnotation({
          id: 4,
          annotatedResourceId: 4,
        }),
      },
    },
    annotationColorMap: {},
  };
  const fileIds = [1, 2, 3, 4];
  const explorerState: ExplorerState = {
    ...mockState,
    files: {
      byId: VisionFilesToFileState(
        mockFileList.filter((file) => fileIds.includes(file.id))
      ),
      allIds: [1, 2, 3, 4],
      selectedIds: [1, 2, 3],
    },
  };
  const rootState: RootState = {
    explorerReducer: explorerState,
    annotationReducer: annoState,
  } as RootState;

  describe('Test selectExplorerFilesWithAnnotationCount', () => {
    test('Should return correct annotation counts', () => {
      const files = selectExplorerFilesWithAnnotationCount(rootState);
      expect(files.map((file) => file.id)).toEqual([1, 2, 3, 4]);
      expect(files.map((file) => file.annotationCount)).toEqual([2, 0, 0, 1]);
    });
  });

  describe('Test selectExplorerSortedFiles', () => {
    test('Files should be sorted by annotationCount', () => {
      const sortedFiles = selectExplorerSortedFiles(rootState);
      expect(sortedFiles.map((file) => file.annotationCount)).toEqual([
        0, 0, 1, 2,
      ]);
    });
  });

  describe('Test selectExplorerSelectedFileIdsInSortedOrder', () => {
    test('Selected fileIds should be sorted by annotationCount', () => {
      const selectedFileIdsSorted =
        selectExplorerSelectedFileIdsInSortedOrder(rootState);
      expect(selectedFileIdsSorted).toEqual([3, 2, 1]);
    });
  });

  describe('Test selectExplorerAllSelectedFilesInSortedOrder', () => {
    test('Selected files should be sorted by annotationCount', () => {
      const selectedFilesSorted =
        selectExplorerAllSelectedFilesInSortedOrder(rootState);
      expect(selectedFilesSorted.map((file) => file.id)).toEqual([3, 2, 1]);
    });
  });
});
