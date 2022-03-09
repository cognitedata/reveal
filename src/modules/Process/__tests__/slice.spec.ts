import { ProcessState } from 'src/modules/Process/store/types';
import reducer, {
  addProcessUploadedFileId,
  addToAvailableDetectionModels,
  clearUploadedFiles,
  initialState,
  removeJobById,
  resetDetectionModelParameters,
  revertDetectionModelParameters,
  setCustomModelName,
  setDetectionModelParameters,
  setProcessFileIds,
  setProcessViewFileUploadModalVisibility,
  setSelectedDetectionModels,
  setSelectFromExploreModalVisibility,
  setSummaryModalVisibility,
  setUnsavedDetectionModelSettings,
} from 'src/modules/Process/store/slice';
import { mockFileIds } from 'src/__test-utils/data/mockFileInfo';
import {
  filesWithJobs,
  jobState,
  jobIds,
  partiallyCompletedJob,
} from 'src/__test-utils/data/mockJobInfo';
import { clearFileState, fileProcessUpdate } from 'src/store/commonActions';
import { CreateVisionJob } from 'src/store/thunks/Process/CreateVisionJob';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import {
  ParamsCustomModel,
  ParamsObjectDetection,
  ParamsOCR,
  ParamsTagDetection,
  VisionDetectionModelType,
  VisionJob,
} from 'src/api/vision/detectionModels/types';
import { getFakeQueuedJob } from 'src/api/vision/detectionModels/detectionUtils';

describe('Test process reducers', () => {
  const mockProcessState: ProcessState = {
    ...initialState,
    fileIds: mockFileIds,
    files: {
      byId: filesWithJobs,
      allIds: mockFileIds,
    },
    jobs: {
      byId: jobState,
      allIds: jobIds,
    },
    availableDetectionModels: [
      ...initialState.availableDetectionModels,
      {
        modelName: 'Custom model',
        type: VisionDetectionModelType.CustomModel,
        settings: {
          threshold: 0.8,
        },
        unsavedSettings: {
          threshold: 0.8,
        },
      },
    ],
  };

  test('should return the initial state for undefined state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('action setProcessFileIds', () => {
    test('should set new file ids', () => {
      let newState = reducer(mockProcessState, setProcessFileIds(mockFileIds));
      expect(newState.fileIds).toEqual(mockFileIds);

      newState = reducer(mockProcessState, setProcessFileIds([13]));
      expect(newState.fileIds).toEqual([13]);
    });

    test('should set file ids empty', () => {
      const newState = reducer(mockProcessState, setProcessFileIds([]));
      expect(newState.fileIds).toEqual([]);
    });
  });

  describe('action setSelectedDetectionModels', () => {
    test('should set Selected Detection Models', () => {
      let newState = reducer(
        mockProcessState,
        setSelectedDetectionModels([VisionDetectionModelType.OCR])
      );
      expect(newState.selectedDetectionModels).toEqual([
        VisionDetectionModelType.OCR,
      ]);

      newState = reducer(
        mockProcessState,
        setSelectedDetectionModels([
          VisionDetectionModelType.OCR,
          VisionDetectionModelType.ObjectDetection,
        ])
      );
      expect(newState.selectedDetectionModels).toEqual([
        VisionDetectionModelType.OCR,
        VisionDetectionModelType.ObjectDetection,
      ]);
    });

    test('should set Selected Detection Models to empty', () => {
      const modifiedMockProcessState = {
        ...mockProcessState,
        selectedDetectionModels: [
          VisionDetectionModelType.TagDetection,
          VisionDetectionModelType.CustomModel,
        ],
      };
      const newState = reducer(
        modifiedMockProcessState,
        setSelectedDetectionModels([])
      );
      expect(newState.selectedDetectionModels).toEqual([]);
    });
  });

  describe('action addToAvailableDetectionModels', () => {
    test('should have added a custom detection model', () => {
      const newState = reducer(
        mockProcessState,
        addToAvailableDetectionModels()
      );
      expect(newState.availableDetectionModels[3].type).toEqual(
        VisionDetectionModelType.CustomModel
      );
      expect(newState.availableDetectionModels[3].modelName).toEqual(
        'Custom model'
      );
    });
  });

  describe('Test logic related to detection model', () => {
    const mockProcessStateWithUnsavedSettings = {
      ...mockProcessState,
      availableDetectionModels: [
        {
          modelName: 'Text detection',
          type: VisionDetectionModelType.OCR,
          settings: { useCache: true },
          unsavedSettings: { useCache: false },
        },
        {
          modelName: 'Asset tag detection',
          type: VisionDetectionModelType.TagDetection,
          settings: {
            useCache: false,
            partialMatch: true,
            assetSubtreeIds: [1],
          },
          unsavedSettings: {
            useCache: false,
            partialMatch: false,
            assetSubtreeIds: [1, 2],
          },
        },
        {
          modelName: 'Object detection',
          type: VisionDetectionModelType.ObjectDetection,
          settings: {
            threshold: 0.85,
          },
          unsavedSettings: {
            threshold: 0.9,
          },
        },
        {
          modelName: 'Custom model',
          type: VisionDetectionModelType.CustomModel,
          settings: {
            threshold: 0.85,
          },
          unsavedSettings: {
            threshold: 0.9,
          },
        },
      ],
    };

    describe('action setUnsavedDetectionModelSettings', () => {
      test('set Unsaved Detection Model Settings for OCR', () => {
        const modelIndex: number = 0;
        const params: ParamsOCR = { useCache: false };
        const newState = reducer(
          mockProcessState,
          setUnsavedDetectionModelSettings({
            modelIndex,
            params,
          })
        );
        expect(
          newState.availableDetectionModels[modelIndex].unsavedSettings
        ).toEqual(params);
      });

      test('set Unsaved Detection Model Settings for Tag Detection', () => {
        const modelIndex: number = 1;
        const params: ParamsTagDetection = {
          useCache: false,
          partialMatch: false,
          assetSubtreeIds: [5],
        };
        const newState = reducer(
          mockProcessState,
          setUnsavedDetectionModelSettings({
            modelIndex,
            params,
          })
        );
        expect(
          newState.availableDetectionModels[modelIndex].unsavedSettings
        ).toEqual(params);
      });

      test('set Unsaved Detection Model Settings for Object Detection', () => {
        const modelIndex: number = 2;
        const params: ParamsObjectDetection = {
          threshold: 0.6,
        };
        const newState = reducer(
          mockProcessState,
          setUnsavedDetectionModelSettings({
            modelIndex,
            params,
          })
        );
        expect(
          newState.availableDetectionModels[modelIndex].unsavedSettings
        ).toEqual(params);
      });

      test('set Unsaved Detection Model Settings for Custom Model', () => {
        const modelIndex: number = 3;
        const params: ParamsCustomModel = {
          threshold: 0.6,
        };
        const newState = reducer(
          mockProcessState,
          setUnsavedDetectionModelSettings({
            modelIndex,
            params,
          })
        );
        expect(
          newState.availableDetectionModels[modelIndex].unsavedSettings
        ).toEqual(params);
      });

      test('app should not crash if model index is not available', () => {
        const modelIndex: number = 4;
        const params: ParamsCustomModel = {
          threshold: 0.6,
        };
        reducer(
          mockProcessState,
          setUnsavedDetectionModelSettings({
            modelIndex,
            params,
          })
        );
      });
    });

    describe('action setDetectionModelParameters', () => {
      test('set unsaved settings as settings', () => {
        const newState = reducer(
          mockProcessStateWithUnsavedSettings,
          setDetectionModelParameters()
        );
        for (let modelIndex = 0; modelIndex < 4; modelIndex++) {
          expect(
            newState.availableDetectionModels[modelIndex].settings
          ).toEqual(
            mockProcessStateWithUnsavedSettings.availableDetectionModels[
              modelIndex
            ].unsavedSettings
          );
          expect(
            newState.availableDetectionModels[modelIndex].settings
          ).toEqual(
            newState.availableDetectionModels[modelIndex].unsavedSettings
          );
        }
      });
    });

    describe('action revertDetectionModelParameters', () => {
      test('set settings as unsaved settings to reset unsaved settings', () => {
        const newState = reducer(
          mockProcessStateWithUnsavedSettings,
          revertDetectionModelParameters()
        );
        for (let modelIndex = 0; modelIndex < 4; modelIndex++) {
          expect(
            newState.availableDetectionModels[modelIndex].unsavedSettings
          ).toEqual(
            mockProcessStateWithUnsavedSettings.availableDetectionModels[
              modelIndex
            ].settings
          );
          expect(
            newState.availableDetectionModels[modelIndex].unsavedSettings
          ).toEqual(newState.availableDetectionModels[modelIndex].settings);
        }
      });
    });

    describe('action resetDetectionModelParameters', () => {
      test('reset unsaved settings to initial state', () => {
        const newState = reducer(
          mockProcessStateWithUnsavedSettings,
          resetDetectionModelParameters()
        );
        for (let modelIndex = 0; modelIndex < 4; modelIndex++) {
          expect(
            newState.availableDetectionModels[modelIndex].unsavedSettings
          ).toEqual(
            mockProcessState.availableDetectionModels[modelIndex].settings
          );
        }
      });
    });

    // Function should works for all the model indexes
    // but only use for update name of custom model in the UI
    describe('action setCustomModelName', () => {
      test('Update the Modal name', () => {
        const newModelName = 'New Name';
        for (let modelIndex = 0; modelIndex < 4; modelIndex++) {
          const newState = reducer(
            mockProcessState,
            setCustomModelName({ modelIndex, modelName: newModelName })
          );
          expect(
            newState.availableDetectionModels[modelIndex].modelName
          ).toEqual(newModelName);
        }
      });
    });
  });

  describe('action removeJobById', () => {
    test('should remove jobId, job and remove job from files', () => {
      const newState = reducer(mockProcessState, removeJobById(jobIds[1]));
      expect(newState.jobs.allIds.includes(jobIds[1])).toBe(false);
      expect(newState.jobs.byId[jobIds[1]]).toBe(undefined);

      // should remove Job From Files
      mockFileIds.forEach((fileId) => {
        expect(newState.files.byId[fileId].jobIds.includes(jobIds[1])).toBe(
          false
        );
      });
    });

    test('for invalid job id nothing should change', () => {
      const newState = reducer(mockProcessState, removeJobById(123));
      expect(newState.jobs.allIds).toEqual(jobIds);
      expect(newState.jobs.byId).toEqual(jobState);
      expect(newState.files.allIds).toEqual(mockFileIds);
      expect(newState.files.byId).toEqual(filesWithJobs);
    });
  });

  describe('action setProcessViewFileUploadModalVisibility', () => {
    test('should change upload modal visibility', () => {
      let newState = reducer(
        mockProcessState,
        setProcessViewFileUploadModalVisibility(true)
      );
      expect(newState.showFileUploadModal).toBe(true);

      newState = reducer(
        mockProcessState,
        setProcessViewFileUploadModalVisibility(false)
      );
      expect(newState.showFileUploadModal).toBe(false);
    });
  });

  describe('action setSelectFromExploreModalVisibility', () => {
    test('should change explore modal visibility', () => {
      let newState = reducer(
        mockProcessState,
        setSelectFromExploreModalVisibility(true)
      );
      expect(newState.showExploreModal).toBe(true);

      newState = reducer(
        mockProcessState,
        setSelectFromExploreModalVisibility(false)
      );
      expect(newState.showExploreModal).toBe(false);
    });
  });

  describe('action setSummaryModalVisibility', () => {
    test('should change summary modal visibility', () => {
      let newState = reducer(mockProcessState, setSummaryModalVisibility(true));
      expect(newState.showSummaryModal).toBe(true);

      newState = reducer(mockProcessState, setSummaryModalVisibility(false));
      expect(newState.showSummaryModal).toBe(false);
    });
  });

  describe('action addProcessUploadedFileId', () => {
    test('should add file id as a uploaded file id', () => {
      const newState = reducer(mockProcessState, addProcessUploadedFileId(101));
      expect(newState.uploadedFileIds.includes(101)).toBe(true);
    });
  });

  describe('action clearUploadedFiles', () => {
    test('uploadedFileIds should stay as a empty', () => {
      const newState = reducer(mockProcessState, clearUploadedFiles());
      expect(newState.uploadedFileIds).toEqual([]);
    });

    test('should clear uploaded Files', () => {
      const mockProcessStateWithUploadedFileIds = {
        ...mockProcessState,
        uploadedFileIds: [101, 102, 103, 104],
      };
      const newState = reducer(
        mockProcessStateWithUploadedFileIds,
        clearUploadedFiles()
      );
      expect(newState.uploadedFileIds).toEqual([]);
    });
  });

  describe('extra reducer fileProcessUpdate', () => {
    describe('for a new job', () => {
      const { fileIds } = partiallyCompletedJob;
      const job: VisionJob = {
        jobId: 500,
        type: VisionDetectionModelType.CustomModel,
        status: 'Running',
        createdTime: 1643352030229,
        statusTime: 1643352030229,
        startTime: 1643352030660,
      };
      const modelType: VisionDetectionModelType =
        VisionDetectionModelType.CustomModel;
      const completedFileIds: number[] = [1, 2];
      const failedFileIds: number[] = [4, 5, 6];
      const action = {
        type: fileProcessUpdate,
        payload: { fileIds, job, modelType, completedFileIds, failedFileIds },
      };

      const newState = reducer(mockProcessState, action);
      test('New job should added to jobs', () => {
        expect(newState.jobs.allIds.includes(job.jobId)).toBe(true);
        expect(newState.jobs.byId[job.jobId].jobId).toEqual(job.jobId);
        expect(newState.jobs.byId[job.jobId].type).toEqual(job.type);
        expect(newState.jobs.byId[job.jobId].status).toEqual(job.status);
      });
      test('files should have new job assigned', () => {
        fileIds.forEach((fileId) => {
          expect(newState.files.byId[fileId].jobIds.includes(job.jobId)).toBe(
            true
          );
        });
      });
      test('should have completedFileIds', () => {
        expect(newState.jobs.byId[job.jobId].completedFileIds).toBe(
          completedFileIds
        );
      });
      test('should have failedFileIds', () => {
        expect(newState.jobs.byId[job.jobId].failedFileIds).toBe(failedFileIds);
      });
    });
    describe('for a existing job', () => {
      const fileIds: number[] = mockFileIds;
      const job: VisionJob = {
        jobId: 200,
        type: VisionDetectionModelType.ObjectDetection,
        status: 'Completed',
        createdTime: 1643352030229,
        statusTime: 1643352030229,
        startTime: 1643352030660,
        items: [],
      };
      const modelType: VisionDetectionModelType =
        VisionDetectionModelType.ObjectDetection;
      const completedFileIds: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const failedFileIds: number[] = [11, 12];
      const action = {
        type: fileProcessUpdate,
        payload: { fileIds, job, modelType, completedFileIds, failedFileIds },
      };

      const newState = reducer(mockProcessState, action);
      test('job should be listed in jobs', () => {
        expect(newState.jobs.allIds.includes(job.jobId)).toBe(true);
        expect(newState.jobs.byId[job.jobId].jobId).toEqual(job.jobId);
        expect(newState.jobs.byId[job.jobId].type).toEqual(job.type);
        expect(newState.jobs.byId[job.jobId].status).toEqual(job.status);
      });
      test('files should have the job assigned', () => {
        fileIds.forEach((fileId) => {
          expect(newState.files.byId[fileId].jobIds.includes(job.jobId)).toBe(
            true
          );
        });
      });
      test('should have completedFileIds', () => {
        expect(newState.jobs.byId[job.jobId].completedFileIds).toBe(
          completedFileIds
        );
      });
      test('should have failedFileIds', () => {
        expect(newState.jobs.byId[job.jobId].failedFileIds).toBe(failedFileIds);
      });
    });
  });

  describe('extra reducer CreateVisionJob', () => {
    test('job should added to state when CreateVisionJob pending', () => {
      const fileIds: number[] = [1, 2, 3];
      const modelType: VisionDetectionModelType =
        VisionDetectionModelType.TagDetection;
      const action = {
        type: CreateVisionJob.pending,
        meta: { arg: { fileIds, modelType } },
      };
      const newState = reducer(mockProcessState, action);

      const fakeQueuedJobId = getFakeQueuedJob(
        VisionDetectionModelType.TagDetection
      ).jobId;
      expect(newState.jobs.byId[fakeQueuedJobId].jobId).toEqual(
        fakeQueuedJobId
      );
      expect(newState.jobs.byId[fakeQueuedJobId].fileIds).toEqual(fileIds);
      expect(newState.jobs.byId[fakeQueuedJobId].type).toEqual(modelType);
    });

    test('job should added to state when CreateVisionJob fulfilled', () => {
      const jobId = 500;
      const newJob: VisionJob = {
        type: VisionDetectionModelType.ObjectDetection,
        startTime: null,
        status: 'Queued',
        createdTime: 1643352030229,
        jobId,
        statusTime: 1643352030229,
      };
      const fileIds: number[] = [1, 2, 3, 4, 5, 6];
      const modelType: VisionDetectionModelType =
        VisionDetectionModelType.ObjectDetection;
      const action = {
        type: CreateVisionJob.fulfilled,
        payload: newJob,
        meta: { arg: { fileIds, modelType } },
      };
      const newState = reducer(mockProcessState, action);

      expect(newState.jobs.byId[jobId].jobId).toEqual(jobId);
      expect(newState.jobs.byId[jobId].fileIds).toEqual(fileIds);
      expect(newState.jobs.byId[jobId].type).toEqual(modelType);
      expect(newState.jobs.byId[jobId].status).toEqual(newJob.status);
    });

    test('job should removed from state when CreateVisionJob rejected', () => {
      const fileIds: number[] = [1, 2, 3];
      const modelType: VisionDetectionModelType =
        VisionDetectionModelType.ObjectDetection;
      const fakeQueuedJob = {
        ...getFakeQueuedJob(modelType),
        type: modelType,
        fileIds,
      };
      const fakeQueuedJobId = getFakeQueuedJob(modelType).jobId;
      const previousState = {
        ...mockProcessState,
        files: {
          byId: {
            1: { jobIds: [100, fakeQueuedJobId] },
            2: { jobIds: [100, fakeQueuedJobId] },
            3: { jobIds: [100, fakeQueuedJobId] },
          },
          allIds: fileIds,
        },
        jobs: {
          byId: {
            [fakeQueuedJobId]: {
              ...fakeQueuedJob,
            },
          },
          allIds: [100, fakeQueuedJobId],
        },
      };

      const action = {
        type: CreateVisionJob.rejected,
        error: { message: 'error message' },
        meta: { arg: { fileIds, modelType } },
      };

      const newState = reducer(previousState, action);
      expect(newState.jobs.byId[fakeQueuedJobId]).toEqual(undefined);
      fileIds.forEach((id) => {
        expect(newState.files.byId[id].jobIds.includes(fakeQueuedJobId)).toBe(
          false
        );
      });
      expect(newState.error).toEqual('error message');
    });
  });

  describe('extra reducer DeleteFilesById', () => {
    const actionTypes = [DeleteFilesById.fulfilled.type, clearFileState.type];

    test('no file should removed when file ids are empty', () => {
      const deletedFileIds: number[] = [];
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(mockProcessState, action);

        expect(newState.fileIds).toEqual(mockFileIds);
        expect(newState.files.allIds).toEqual(mockFileIds);
        expect(
          Object.keys(newState.files.byId).map((id) => parseInt(id, 10))
        ).toEqual(mockFileIds);
      });
    });

    const deletedFileIds: number[] = [1, 4, 5];

    test('file ids should removed from fileIds', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(mockProcessState, action);

        deletedFileIds.forEach((deletedFileId) => {
          expect(newState.fileIds.includes(deletedFileId)).toBe(false);
        });
      });
    });

    test('file ids and objects should removed from files', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(mockProcessState, action);

        deletedFileIds.forEach((deletedFileId) => {
          expect(newState.fileIds.includes(deletedFileId)).toBe(false);
          expect(newState.files.allIds.includes(deletedFileId)).toBe(false);
          expect(
            Object.keys(newState.files.byId)
              .map((id) => parseInt(id, 10))
              .includes(deletedFileId)
          ).toBe(false);
        });
      });
    });

    test('file id should be removed from fileIds, completedFileIds and failedFileIds in jobs', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(mockProcessState, action);
        jobIds.forEach((jobId) => {
          const job = newState.jobs.byId[jobId];
          deletedFileIds.forEach((deletedFileId) => {
            expect(job.fileIds.includes(deletedFileId)).toBe(false);
            expect(!!job.completedFileIds?.includes(deletedFileId)).toBe(false);
            expect(!!job.failedFileIds?.includes(deletedFileId)).toBe(false);
          });
        });
      });
    });

    test('should hide drawer and reset selected file when DeleteFilesById fulfilled', () => {
      const previousState = {
        ...mockProcessState,
        focusedFileId: 4,
        showFileMetadata: true,
      };
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(previousState, action);

        expect(newState.focusedFileId).toBe(null);
        expect(newState.showFileMetadata).toBe(false);
      });
    });

    test('should clear upload state when DeleteFilesById fulfilled', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: deletedFileIds,
        };
        const newState = reducer(mockProcessState, action);

        deletedFileIds.forEach((deletedFileId) => {
          expect(newState.uploadedFileIds.includes(deletedFileId)).toBe(false);
        });
      });
    });

    test('if every file of a job is deleted job should be removed', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: [10, 11, 12],
        };
        const newState = reducer(mockProcessState, action);

        expect(newState.jobs.allIds.includes(400)).toBe(false);
        expect(newState.jobs.byId[400]).toBe(undefined);
      });
    });
  });
});
