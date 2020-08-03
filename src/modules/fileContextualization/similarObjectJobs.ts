import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { callUntilCompleted } from 'helpers/Helpers';
import { RootState } from 'reducers';
import { isSimilarBoundingBox } from 'utils/AnnotationUtils';
import { trackTimedUsage } from 'utils/Metrics';
import { AnnotationBoundingBox } from '@cognite/annotations';
import sdk from 'sdk-singleton';
import { ModelStatus } from 'types/Types';

const SIMILARITY_JOB_CREATE_STARTED = 'pnid/SIMILARITY_JOB_CREATE_STARTED';
const SIMILARITY_JOB_CREATED = 'pnid/SIMILARITY_JOB_CREATED';
const SIMILARITY_JOB_STATUS_UPDATED = 'pnid/SIMILARITY_JOB_STATUS_UPDATED';
const SIMILARITY_JOB_DONE = 'pnid/SIMILARITY_JOB_DONE';
const SIMILARITY_JOB_ERROR = 'pnid/SIMILARITY_JOB_ERROR';
interface CreateSimilarityJobStartedAction
  extends Action<typeof SIMILARITY_JOB_CREATE_STARTED> {
  fileId: number;
  boundingBox: string;
}
interface SimilarityJobCreatedAction
  extends Action<typeof SIMILARITY_JOB_CREATED> {
  fileId: number;
  boundingBox: string;
  jobId: number;
}
interface SimilarityJobStatusUpdatedAction
  extends Action<typeof SIMILARITY_JOB_STATUS_UPDATED> {
  fileId: number;
  boundingBox: string;
  jobId: number;
  status: ModelStatus;
}
interface SimilarityJobDoneAction extends Action<typeof SIMILARITY_JOB_DONE> {
  fileId: number;
  boundingBox: string;
  annotations: SimilarResponseEntity[];
}
interface SimilarityJobErrorAction extends Action<typeof SIMILARITY_JOB_ERROR> {
  fileId: number;
  boundingBox: string;
}

type SimilarityJobActions =
  | CreateSimilarityJobStartedAction
  | SimilarityJobCreatedAction
  | SimilarityJobStatusUpdatedAction
  | SimilarityJobDoneAction
  | SimilarityJobErrorAction;

const createSimilarityJobPath = (project: string) =>
  `/api/playground/projects/${project}/context/pnidobjects/findsimilar`;
const getSimilarityJobStatusPath = (project: string, jobid: number) =>
  `/api/playground/projects/${project}/context/pnidobjects/${jobid}`;

export const findSimilarObjects = (
  fileId: number,
  boundingBox: AnnotationBoundingBox
) => {
  return async (
    dispatch: ThunkDispatch<any, any, SimilarityJobActions>,
    getState: () => RootState
  ) => {
    const {
      annotations: {
        byFileId: { [fileId]: currentAnnotation },
      },
    } = getState();

    const annotations = currentAnnotation
      ? currentAnnotation.annotations || []
      : [];

    const boundingBoxKey = JSON.stringify(boundingBox);

    dispatch({
      type: SIMILARITY_JOB_CREATE_STARTED,
      boundingBox: boundingBoxKey,
      fileId,
    });
    return new Promise((resolve, reject) => {
      const timer = trackTimedUsage(
        'Contextualization.PnidParsing.SimilarObjectsJob',
        {
          fileId,
        }
      );

      sdk
        .post(createSimilarityJobPath(sdk.project), {
          data: {
            fileId,
            template: {
              boundingBox,
              type: 'detection',
            },
          },
        })
        .then(response => {
          const {
            status: httpStatus,
            data: { jobId, status: queueStatus },
          } = response;
          dispatch({
            type: SIMILARITY_JOB_CREATED,
            boundingBox: boundingBoxKey,
            jobId,
            fileId,
          });
          dispatch({
            type: SIMILARITY_JOB_STATUS_UPDATED,
            boundingBox: boundingBoxKey,
            jobId,
            status: queueStatus,
            fileId,
          });

          if (httpStatus === 200) {
            callUntilCompleted(
              () => sdk.get(getSimilarityJobStatusPath(sdk.project, jobId)),
              data => data.status === 'Completed' || data.status === 'Failed',
              async data => {
                if (data.status === 'Failed') {
                  dispatch({
                    type: SIMILARITY_JOB_ERROR,
                    boundingBox: boundingBoxKey,
                    fileId,
                  });
                  reject();
                } else {
                  // completed
                  await dispatch({
                    type: SIMILARITY_JOB_DONE,
                    boundingBox: boundingBoxKey,
                    jobId,
                    fileId,
                    annotations: (data.items as SimilarResponseEntity[]).filter(
                      el => {
                        return (
                          !isSimilarBoundingBox(
                            boundingBox,
                            el.boundingBox,
                            0.25,
                            false
                          ) &&
                          !annotations.some(
                            anno =>
                              isSimilarBoundingBox(
                                anno.box,
                                el.boundingBox,
                                0.5,
                                true
                              ) ||
                              isSimilarBoundingBox(
                                anno.box,
                                el.boundingBox,
                                0.1,
                                false
                              )
                          )
                        );
                      }
                    ),
                  });

                  resolve(jobId);

                  timer.stop({ success: true, jobId });
                }
              },
              tickStatus => {
                dispatch({
                  type: SIMILARITY_JOB_STATUS_UPDATED,
                  boundingBox: boundingBoxKey,
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
              type: SIMILARITY_JOB_ERROR,
              boundingBox: boundingBoxKey,
              fileId,
            });
            reject();
            timer.stop({ success: false, jobId });
          }
        })
        .catch(() => {
          dispatch({
            type: SIMILARITY_JOB_ERROR,
            boundingBox: boundingBoxKey,
            fileId,
          });
          reject();
          timer.stop({ success: false });
        });
    });
  };
};

export interface SimilarResponseEntity {
  score: number;
  type: 'string';
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export interface SimilarityJobState {
  jobStarted: boolean;
  jobId?: number;
  jobStatus: ModelStatus;
  jobDone: boolean;
  jobError: boolean;
  datasetId: number;
  annotations?: SimilarResponseEntity[];
}

type Actions = SimilarityJobActions;

export interface SimilarJobStore {
  [fileId: number]: { [boundingbox: string]: SimilarityJobState };
}

const initialPnIDState: SimilarJobStore = {};

export const similarObjectJobsReducer = (
  state: SimilarJobStore = initialPnIDState,
  action: Actions
): SimilarJobStore => {
  switch (action.type) {
    case SIMILARITY_JOB_CREATE_STARTED: {
      const fileJobs = state[action.fileId] || {};
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          [action.boundingBox]: {
            ...fileJobs[action.boundingBox],
            jobStarted: true,
            jobStatus: 'Queued',
            jobDone: false,
            jobError: false,
          },
        },
      };
    }
    case SIMILARITY_JOB_CREATED: {
      const fileJobs = state[action.fileId] || {};
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          [action.boundingBox]: {
            ...fileJobs[action.boundingBox],
            jobId: action.jobId,
          },
        },
      };
    }
    case SIMILARITY_JOB_STATUS_UPDATED: {
      const fileJobs = state[action.fileId] || {};
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          [action.boundingBox]: {
            ...fileJobs[action.boundingBox],
            jobId: action.jobId,
            jobStatus: action.status,
          },
        },
      };
    }
    case SIMILARITY_JOB_DONE: {
      const fileJobs = state[action.fileId] || {};
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          [action.boundingBox]: {
            ...fileJobs[action.boundingBox],
            jobDone: true,
            annotations: action.annotations,
          },
        },
      };
    }
    case SIMILARITY_JOB_ERROR: {
      const fileJobs = state[action.fileId] || {};
      return {
        ...state,
        [action.fileId]: {
          ...fileJobs,
          [action.boundingBox]: {
            ...fileJobs[action.boundingBox],
            jobDone: true,
            jobError: true,
          },
        },
      };
    }
    default: {
      return state;
    }
  }
};
