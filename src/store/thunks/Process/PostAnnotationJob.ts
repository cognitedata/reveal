import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createAnnotationJob, fetchJobById } from 'src/api/annotationJob';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/Process/AnnotationDetectionJobUpdate';
import { fetchUntilComplete } from 'src/utils';
import { fileProcessUpdate } from 'src/store/commonActions';
import { removeJobById, State } from 'src/modules/Process/processSlice';

export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: VisionAPIType; fileIds: number[] },
  ThunkConfig
>(
  'process/postAnnotationJobs',
  async ({ modelType, fileIds }, { dispatch, getState }) => {
    const params = getDetectionModelParameters(
      getState().processSlice,
      modelType
    );
    const createdJob = await createAnnotationJob(modelType, fileIds, params);

    const doesFileExist = (fileId: number) =>
      getState().filesSlice.files.byId[fileId];

    await fetchUntilComplete<AnnotationJob>(
      () => fetchJobById(createdJob.type, createdJob.jobId),
      {
        isCompleted: (latestJobVersion) =>
          latestJobVersion.status === 'Completed' ||
          latestJobVersion.status === 'Failed' ||
          !fileIds.some(doesFileExist), // we don't want to poll jobs for removed files

        onTick: async (latestJobVersion) => {
          await dispatch(AnnotationDetectionJobUpdate(latestJobVersion));
          if (latestJobVersion.status === 'Completed') {
            await dispatch(RetrieveAnnotations(fileIds));
          }
          dispatch(
            fileProcessUpdate({
              modelType,
              fileIds,
              job: latestJobVersion,
            })
          );
        },

        onError: (error) => {
          dispatch(removeJobById(createdJob.jobId));
          // eslint-disable-next-line no-console
          console.error(error); // todo better error handling of polling errors
        },
      }
    );

    return createdJob;
  }
);

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  switch (modelType) {
    case VisionAPIType.OCR: {
      return state.detectionModelParameters.ocr;
    }
    case VisionAPIType.TagDetection: {
      return state.detectionModelParameters.tagDetection;
    }
    case VisionAPIType.ObjectDetection: {
      return state.detectionModelParameters.objectDetection;
    }
    default: {
      return undefined;
    }
  }
};
