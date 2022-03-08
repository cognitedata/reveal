import { RootState } from 'src/store/rootReducer';
import { ProcessState } from 'src/modules/Process/store/types';
import { initialState as processSliceInitialState } from 'src/modules/Process/store/slice';
import { initialState as fileSliceInitialState } from 'src/modules/Common/store/files/slice';
import {
  makeSelectJobStatusForFile,
  selectAllFilesDict,
  selectAllJobs,
  selectAllJobsForAllFilesDict,
  selectAllProcessFiles,
  selectIsPollingComplete,
  selectIsProcessingStarted,
  selectJobIdsByFileId,
  selectJobsByFileId,
  selectPageCount,
  selectProcessAllSelectedFilesInSortedOrder,
  selectProcessSelectedFileIdsInSortedOrder,
  selectProcessSortedFiles,
  selectUnfinishedJobs,
} from 'src/modules/Process/store/selectors';
import { convertToVisionFileState } from 'src/__test-utils/files';
import {
  mockFileInfo,
  mockFileIds,
  INVALID_FILE_ID,
  mockFileIdsSortedByNameAscending,
  mockFileIdsSortedByNameDescending,
  mockFileIdsSortedByMimeTypeAscending,
  mockFileIdsSortedByMimeTypeDescending,
} from 'src/__test-utils/data/mockFileInfo';
import { FileState, VisionFile } from 'src/modules/Common/store/files/types';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import {
  filesWithJobs,
  jobState,
  jobIds,
  completedJob,
  failedJob,
} from 'src/__test-utils/data/mockJobInfo';

// Process State
const mockProcessState: ProcessState = {
  ...processSliceInitialState,
  fileIds: mockFileIds,
  files: {
    byId: filesWithJobs,
    allIds: mockFileIds,
  },
  jobs: {
    byId: jobState,
    allIds: jobIds,
  },
};
const mockProcessStatesWithCompletedJob: ProcessState = {
  ...processSliceInitialState,
  fileIds: [1, 2, 3],
  files: {
    byId: {
      2: { jobIds: [300] },
      3: { jobIds: [300] },
      4: { jobIds: [300] },
      5: { jobIds: [300] },
      6: { jobIds: [300] },
      7: { jobIds: [300] },
      8: { jobIds: [300] },
      9: { jobIds: [300] },
    },
    allIds: [2, 3, 4, 5, 6, 7, 8, 9],
  },
  jobs: {
    byId: { 300: completedJob },
    allIds: [300],
  },
};
const mockProcessStatesWithFailedJob: ProcessState = {
  ...processSliceInitialState,
  fileIds: [10, 11, 12],
  files: {
    byId: {
      10: { jobIds: [400] },
      11: { jobIds: [400] },
      12: { jobIds: [400] },
    },
    allIds: [10, 11, 12],
  },
  jobs: {
    byId: {
      400: failedJob,
    },
    allIds: [400],
  },
};

// File State
const mockVisionFileState = convertToVisionFileState(mockFileInfo);
const mockFileState: FileState = {
  ...fileSliceInitialState,
  files: { ...mockVisionFileState, selectedIds: [2, 4, 6, 8, 10, 12] },
};

// Root State
const initialRootState: RootState = {
  processSlice: processSliceInitialState,
  fileReducer: fileSliceInitialState,
} as RootState;
const mockRootState: RootState = {
  processSlice: mockProcessState,
  fileReducer: mockFileState,
} as RootState;

describe('Test file process selectors', () => {
  describe('Test selectAllFilesDict', () => {
    test('Return empty for initial state', () => {
      expect(selectAllFilesDict(processSliceInitialState)).toEqual({});
    });

    test('Return files state', () => {
      expect(selectAllFilesDict(mockProcessState)).toEqual(filesWithJobs);
    });
  });

  describe('Test selectAllJobs', () => {
    test('Return empty for initial state', () => {
      expect(selectAllJobs(processSliceInitialState)).toEqual({});
    });

    test('Return jobs state', () => {
      expect(selectAllJobs(mockProcessState)).toEqual(jobState);
    });
  });

  describe('Test selectJobIdsByFileId', () => {
    test('Return empty for initial state', () => {
      expect(selectJobIdsByFileId(processSliceInitialState, 1)).toEqual([]);
    });

    test("Return empty if file doesn't exist", () => {
      expect(selectJobIdsByFileId(mockProcessState, INVALID_FILE_ID)).toEqual(
        []
      );
    });

    test('Return related job ids', () => {
      expect(selectJobIdsByFileId(mockProcessState, 1)).toEqual([
        100, 200, 500,
      ]);
      expect(selectJobIdsByFileId(mockProcessState, 2)).toEqual([
        100, 200, 300, 500,
      ]);
      expect(selectJobIdsByFileId(mockProcessState, 12)).toEqual([
        100, 200, 400,
      ]);
    });

    test('For invalid state with files without jobs', () => {
      // This is a invalid state
      const state = {
        ...mockProcessState,
        files: {
          byId: { ...filesWithJobs, INVALID_FILE_ID: { jobIds: [] } },
          allIds: [...mockFileIds, INVALID_FILE_ID],
        },
      };
      expect(selectJobIdsByFileId(state, INVALID_FILE_ID)).toEqual([]);
    });
  });

  describe('Test selectJobsByFileId', () => {
    test('No jobs should have assigned to files in initial state', () => {
      expect(
        selectJobsByFileId(processSliceInitialState, INVALID_FILE_ID)
      ).toEqual([]);
    });

    test("Return empty if file doesn't exist", () => {
      expect(selectJobsByFileId(mockProcessState, INVALID_FILE_ID)).toEqual([]);
    });

    test('Return related job state', () => {
      const jobs = selectJobsByFileId(mockProcessState, 1);
      expect(jobs.map((job) => job.jobId)).toEqual([100, 200, 500]);
    });
  });

  describe('Test selectAllJobsForAllFilesDict', () => {
    test('Return empty for initial state', () => {
      expect(selectAllJobsForAllFilesDict(processSliceInitialState)).toEqual(
        []
      );
    });

    test('Return related job state', () => {
      const jobs = selectAllJobsForAllFilesDict(mockProcessState);

      const jobsFor1 = jobs.find((job) => job.fileId === '1')?.jobs;
      expect(jobsFor1).not.toEqual({});
      expect(jobsFor1?.map((job) => job.jobId)).toEqual([100, 200, 500]);

      const jobsFor2 = jobs.find((job) => job.fileId === '2')?.jobs;
      expect(jobsFor2).not.toEqual({});
      expect(jobsFor2?.map((job) => job.jobId)).toEqual([100, 200, 300, 500]);
    });
  });

  describe('Test selectAllProcessFiles', () => {
    test('Return empty for initial state', () => {
      expect(selectAllProcessFiles(initialRootState)).toEqual([]);
    });

    test('Return all process files', () => {
      expect(
        selectAllProcessFiles(mockRootState).map((file) => file.id)
      ).toEqual(mockFileIds);
    });
  });

  describe('Test selectIsPollingComplete', () => {
    test('Return true for initial state', () => {
      expect(selectIsPollingComplete(processSliceInitialState)).toEqual(true);
    });

    // Expect false as mock state has Queued and Running jobs
    test('Return false while pending jobs exist', () => {
      expect(selectIsPollingComplete(mockProcessState)).toEqual(false);
    });

    test('Return true when all the jobs are Completed', () => {
      expect(
        selectIsPollingComplete(mockProcessStatesWithCompletedJob)
      ).toEqual(true);
    });

    test('Return true when all the jobs are Failed', () => {
      expect(selectIsPollingComplete(mockProcessStatesWithFailedJob)).toEqual(
        true
      );
    });
  });

  describe('Test selectIsProcessingStarted', () => {
    test('Return false for initial state', () => {
      expect(selectIsProcessingStarted(processSliceInitialState)).toEqual(
        false
      );
    });

    test('Return true while pending jobs exist', () => {
      expect(selectIsProcessingStarted(mockProcessState)).toEqual(true);
    });

    test('Return true when all the jobs are Completed', () => {
      expect(
        selectIsProcessingStarted(mockProcessStatesWithCompletedJob)
      ).toEqual(true);
    });

    test('Return true when all the jobs are Failed', () => {
      expect(selectIsProcessingStarted(mockProcessStatesWithFailedJob)).toEqual(
        true
      );
    });
  });

  describe('Test selectUnfinishedJobs', () => {
    test('Return empty for initial state', () => {
      expect(selectUnfinishedJobs(processSliceInitialState)).toEqual([]);
    });

    test('Return true while pending jobs exist', () => {
      const jobs = selectUnfinishedJobs(mockProcessState);
      expect(jobs).not.toEqual([]);
      expect(jobs.map((job) => job.jobId)).toEqual([100, 200, 500]);
    });

    test('Return true when all the jobs are Completed', () => {
      expect(selectUnfinishedJobs(mockProcessStatesWithCompletedJob)).toEqual(
        []
      );
    });

    test('Return true when all the jobs are Failed', () => {
      expect(selectUnfinishedJobs(mockProcessStatesWithFailedJob)).toEqual([]);
    });
  });

  describe('Test getAnnotationStatuses', () => {
    const getAnnotationStatuses = makeSelectJobStatusForFile();

    test('Return empty objects for initial state', () => {
      const annotationBadgeProps = getAnnotationStatuses(
        processSliceInitialState,
        INVALID_FILE_ID
      );
      expect(annotationBadgeProps).toEqual({
        gdpr: {},
        objects: {},
        tag: {},
        text: {},
      });
    });

    test('Return annotation badge objects for initial state', () => {
      const annotationBadgeProps1 = getAnnotationStatuses(mockProcessState, 1);
      expect(annotationBadgeProps1.text?.status).toEqual('Queued'); // ocr
      expect(annotationBadgeProps1.objects?.status).toEqual('Running'); // ObjectDetection
      expect(annotationBadgeProps1.tag?.status).toEqual('Completed'); // TagDetection
      expect(annotationBadgeProps1.gdpr?.status).toEqual('Running');

      const annotationBadgeProps2 = getAnnotationStatuses(mockProcessState, 2);
      expect(annotationBadgeProps2.text?.status).toEqual('Queued'); // ocr
      expect(annotationBadgeProps2.objects?.status).toEqual('Running'); // ObjectDetection
      expect(annotationBadgeProps2.tag?.status).toEqual('Completed'); // TagDetection
      expect(annotationBadgeProps2.gdpr?.status).toEqual('Running');

      const annotationBadgeProps12 = getAnnotationStatuses(
        mockProcessState,
        12
      );
      expect(annotationBadgeProps12.text?.status).toEqual('Queued'); // ocr
      expect(annotationBadgeProps12.objects?.status).toEqual('Running'); // ObjectDetection
      expect(annotationBadgeProps12.tag?.status).toEqual('Failed'); // TagDetection
      expect(annotationBadgeProps12.gdpr?.status).toEqual('Running');
    });
  });

  describe('Test selectPageCount', () => {
    test('Return zero for initial state', () => {
      expect(selectPageCount(processSliceInitialState)).toEqual(0);
    });

    test('Return page size as 1 for mock state', () => {
      expect(selectPageCount(mockProcessState)).toEqual(1);
    });
  });

  describe('Test selectProcessSortedFiles', () => {
    test('Return empty array for initial state', () => {
      expect(selectProcessSortedFiles(initialRootState)).toEqual([]);
    });

    test('Return jobs by ascending order of file ids for mock state', () => {
      const jobs = selectProcessSortedFiles(mockRootState);
      expect(jobs.map((job) => job.id)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
    });

    // by Name
    test('Return jobs sorted by name in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const jobs = selectProcessSortedFiles(modifiedMockRootState);
      expect(jobs.map((job) => job.id)).toEqual(
        mockFileIdsSortedByNameAscending
      );
    });

    test('Return jobs sorted by name in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const jobs = selectProcessSortedFiles(modifiedMockRootState);
      expect(jobs.map((job) => job.id)).toEqual(
        mockFileIdsSortedByNameDescending
      );
    });

    // by File Type
    test('Return jobs sorted by file type in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const jobs = selectProcessSortedFiles(modifiedMockRootState);
      expect(jobs.map((job) => job.id)).toEqual(
        mockFileIdsSortedByMimeTypeAscending
      );
    });

    test('Return jobs sorted by file type in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const jobs = selectProcessSortedFiles(modifiedMockRootState);
      expect(jobs.map((job) => job.id)).toEqual(
        mockFileIdsSortedByMimeTypeDescending
      );
    });
  });

  describe('Test selectProcessSelectedFileIdsInSortedOrder', () => {
    test('Return empty array for initial state', () => {
      expect(
        selectProcessSelectedFileIdsInSortedOrder(initialRootState)
      ).toEqual([]);
    });

    test('Return only selected file ids in ascending order for mock state', () => {
      expect(selectProcessSelectedFileIdsInSortedOrder(mockRootState)).toEqual([
        2, 4, 6, 8, 10, 12,
      ]);
    });

    // by Name
    const selectedFileIdsSortedByName = [8, 4, 6, 10, 12, 2]; // only even ids are set as selected
    test('Return file ids of files sorted by name in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      expect(
        selectProcessSelectedFileIdsInSortedOrder(modifiedMockRootState)
      ).toEqual(selectedFileIdsSortedByName);
    });

    test('Return file ids of files sorted by name in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      expect(
        selectProcessSelectedFileIdsInSortedOrder(modifiedMockRootState)
      ).toEqual(selectedFileIdsSortedByName.slice().reverse());
    });

    // by File Type
    test('Return jobs sorted by file type in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const selectedFileIdsSortedByMimeType = [6, 4, 2, 8, 10, 12];
      expect(
        selectProcessSelectedFileIdsInSortedOrder(modifiedMockRootState)
      ).toEqual(selectedFileIdsSortedByMimeType);
    });

    test('Return jobs sorted by file type in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const selectedFileIdsSortedByMimeType = [12, 10, 8, 2, 6, 4];
      expect(
        selectProcessSelectedFileIdsInSortedOrder(modifiedMockRootState)
      ).toEqual(selectedFileIdsSortedByMimeType);
    });
  });

  describe('Test selectProcessAllSelectedFilesInSortedOrder', () => {
    test('Return empty array for initial state', () => {
      expect(
        selectProcessAllSelectedFilesInSortedOrder(initialRootState)
      ).toEqual([]);
    });

    test('Return only selected file ids in ascending order for mock state', () => {
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(mockRootState);
      expect(visionFiles.map((file) => file.id)).toEqual([2, 4, 6, 8, 10, 12]);
    });

    // by Name
    const selectedFileIdsSortedByName = [8, 4, 6, 10, 12, 2]; // only even ids are set as selected
    test('Return file ids of files sorted by name in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(modifiedMockRootState);
      expect(visionFiles.map((file) => file.id)).toEqual(
        selectedFileIdsSortedByName
      );
    });

    test('Return file ids of files sorted by name in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'name',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(modifiedMockRootState);
      expect(visionFiles.map((file) => file.id)).toEqual(
        selectedFileIdsSortedByName.slice().reverse()
      );
    });

    // by File Type
    test('Return jobs sorted by file type in ascending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: false,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(modifiedMockRootState);
      const selectedFileIdsSortedByMimeType = [6, 4, 2, 8, 10, 12];
      expect(visionFiles.map((file) => file.id)).toEqual(
        selectedFileIdsSortedByMimeType
      );
    });

    test('Return jobs sorted by file type in descending order', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: mockFileState,
      } as RootState;
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(modifiedMockRootState);
      const selectedFileIdsSortedByMimeType = [12, 10, 8, 2, 6, 4];
      expect(visionFiles.map((file) => file.id)).toEqual(
        selectedFileIdsSortedByMimeType
      );
    });

    test('If non existing file selected', () => {
      const modifiedMockRootState: RootState = {
        processSlice: {
          ...mockProcessState,
          sortMeta: {
            sortKey: 'mimeType',
            reverse: true,
            currentPage: 1,
            pageSize: DEFAULT_PAGE_SIZE,
          },
        },
        fileReducer: {
          ...mockFileState,
          files: { ...mockVisionFileState, selectedIds: [INVALID_FILE_ID] },
        },
      } as RootState;
      const visionFiles: VisionFile[] =
        selectProcessAllSelectedFilesInSortedOrder(modifiedMockRootState);
      expect(visionFiles).toEqual([undefined]);
    });
  });
});
