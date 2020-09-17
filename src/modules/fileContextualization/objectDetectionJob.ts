import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { callUntilCompleted } from 'helpers/Helpers';
import { RootState } from 'reducers';
import { trackTimedUsage } from 'utils/Metrics';
import { ModelStatus } from 'types/Types';
import { createSelector } from 'reselect';
import { getSDK } from 'utils/SDK';

export const OBJECT_DETECTION_CREATE_STARTED =
  'pnid/OBJECT_DETECTION_CREATE_STARTED';
export const OBJECT_DETECTION_CREATED = 'pnid/OBJECT_DETECTION_CREATED';
export const OBJECT_DETECTION_STATUS_UPDATED =
  'pnid/OBJECT_DETECTION_STATUS_UPDATED';
export const OBJECT_DETECTION_DONE = 'pnid/OBJECT_DETECTION_DONE';
export const OBJECT_DETECTION_ERROR = 'pnid/OBJECT_DETECTION_ERROR';
export interface CreateObjectDetectionStartedAction
  extends Action<typeof OBJECT_DETECTION_CREATE_STARTED> {
  fileId: number;
}
export interface ObjectDetectionCreatedAction
  extends Action<typeof OBJECT_DETECTION_CREATED> {
  fileId: number;
  jobId: number;
}
export interface ObjectDetectionStatusUpdatedAction
  extends Action<typeof OBJECT_DETECTION_STATUS_UPDATED> {
  fileId: number;
  jobId: number;
  status: ModelStatus;
}
export interface ObjectDetectionDoneAction
  extends Action<typeof OBJECT_DETECTION_DONE> {
  fileId: number;
  annotations: ObjectDetectionEntity[];
}
export interface ObjectDetectionErrorAction
  extends Action<typeof OBJECT_DETECTION_ERROR> {
  fileId: number;
}

type ObjectDetectionActions =
  | CreateObjectDetectionStartedAction
  | ObjectDetectionCreatedAction
  | ObjectDetectionStatusUpdatedAction
  | ObjectDetectionDoneAction
  | ObjectDetectionErrorAction;

const createObjectDetectionPath = (project: string) =>
  `/api/playground/projects/${project}/context/pnidobjects/findobjects`;
const getObjectDetectionStatusPath = (project: string, jobid: number) =>
  `/api/playground/projects/${project}/context/pnidobjects/${jobid}`;

export const detectObject = (fileId: number) => {
  return async (
    dispatch: ThunkDispatch<any, any, ObjectDetectionActions>,
    getState: () => RootState
  ) => {
    const sdk = getSDK();
    const {
      fileContextualization: {
        objectDetectionJobs: { [fileId]: currentJob },
      },
    } = getState();

    if (currentJob && !currentJob.jobError) {
      return Promise.resolve(currentJob);
    }

    dispatch({
      type: OBJECT_DETECTION_CREATE_STARTED,
      fileId,
    });
    return new Promise((resolve, reject) => {
      const timer = trackTimedUsage(
        'Contextualization.PnidParsing.ObjectDetectionJob',
        {
          fileId,
        }
      );

      sdk
        .post(createObjectDetectionPath(sdk.project), {
          data: {
            fileId,
          },
        })
        .then(response => {
          const {
            status: httpStatus,
            data: { jobId, status: queueStatus },
          } = response;
          dispatch({
            type: OBJECT_DETECTION_CREATED,
            jobId,
            fileId,
          });
          dispatch({
            type: OBJECT_DETECTION_STATUS_UPDATED,
            jobId,
            status: queueStatus,
            fileId,
          });

          if (httpStatus === 200) {
            callUntilCompleted(
              () => sdk.get(getObjectDetectionStatusPath(sdk.project, jobId)),
              data => data.status === 'Completed' || data.status === 'Failed',
              async data => {
                if (data.status === 'Failed') {
                  dispatch({
                    type: OBJECT_DETECTION_ERROR,
                    fileId,
                  });
                  reject();
                } else {
                  // completed
                  await dispatch({
                    type: OBJECT_DETECTION_DONE,
                    jobId,
                    fileId,
                    annotations: data.items as ObjectDetectionEntity[],
                  });

                  resolve(jobId);

                  timer.stop({ success: true, jobId });
                }
              },
              tickStatus => {
                dispatch({
                  type: OBJECT_DETECTION_STATUS_UPDATED,
                  jobId,
                  status: tickStatus,
                  fileId,
                });
              },
              undefined,
              3000
            );
          } else {
            dispatch({
              type: OBJECT_DETECTION_ERROR,
              fileId,
            });
            reject();
            timer.stop({ success: false, jobId });
          }
        })
        .catch(() => {
          dispatch({
            type: OBJECT_DETECTION_ERROR,
            fileId,
          });
          reject();
          timer.stop({ success: false });
        });
    });
  };
};

export interface ObjectDetectionEntity {
  type: string;
  score?: number;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export interface ObjectDetectionState {
  jobStarted: boolean;
  jobId?: number;
  jobStatus: ModelStatus;
  jobDone: boolean;
  jobError: boolean;
  annotations?: ObjectDetectionEntity[];
}

const defaultJob: ObjectDetectionState = {
  jobStarted: true,
  jobStatus: 'New',
  jobDone: false,
  jobError: false,
};

type Actions = ObjectDetectionActions;

export interface ObjectDetectionJobStore {
  [fileId: number]: ObjectDetectionState;
}

const initialPnIDState: ObjectDetectionJobStore = {};

export const objectDetectionJobsReducer = (
  state: ObjectDetectionJobStore = initialPnIDState,
  action: Actions
): ObjectDetectionJobStore => {
  switch (action.type) {
    case OBJECT_DETECTION_CREATE_STARTED: {
      const fileJobs = state[action.fileId] || defaultJob;
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          jobStarted: true,
          jobStatus: 'Queued',
          jobDone: false,
          jobError: false,
        },
      };
    }
    case OBJECT_DETECTION_CREATED: {
      const fileJobs = state[action.fileId] || defaultJob;
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          jobId: action.jobId,
        },
      };
    }
    case OBJECT_DETECTION_STATUS_UPDATED: {
      const fileJobs = state[action.fileId] || defaultJob;
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          jobId: action.jobId,
          jobStatus: action.status,
        },
      };
    }
    case OBJECT_DETECTION_DONE: {
      const fileJobs = state[action.fileId] || defaultJob;
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          jobDone: true,
          annotations: action.annotations,
        },
      };
    }
    case OBJECT_DETECTION_ERROR: {
      const fileJobs = state[action.fileId] || defaultJob;
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          jobDone: true,
          jobError: true,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export const selectObjectJobForFile = createSelector(
  (state: RootState) => state.fileContextualization.objectDetectionJobs,
  objectDetectionJobs => (fileId?: number) => {
    if (!fileId) {
      return undefined;
    }
    const job = objectDetectionJobs[fileId];
    return job;
  }
);
