// import producer from 'immer';
// import { createSelector } from 'reselect';
// import { Action, AnyAction } from 'redux';
// import { ThunkDispatch } from 'redux-thunk';

// import { callUntilCompleted } from 'helpers/Helpers';
// import { RootState } from 'reducers';
// import sdk from 'sdk-singleton';
// import { FeatureType, TrueMatch } from 'types';

export type ModelStatus =
  | 'New'
  | 'Scheduled'
  | 'Queued'
  | 'Completed'
  | 'Running'
  | 'Failed';

// const MODEL_INIT = 'contextualization/MODEL_INIT';
// const MODEL_START = 'contextualization/MODEL_START';
// const MODEL_CREATED = 'contextualization/MODEL_CREATED';
// const MODEL_STATUS_UPDATED = 'contextualization/MODEL_STATUS_UPDATED';
// const MODEL_DONE = 'contextualization/MODEL_DONE';
// const MODEL_ERROR = 'contextualization/MODEL_ERROR';
// const MODEL_RESET = 'contextualization/MODEL_RESET';

// interface CreateModelInitAction extends Action<typeof MODEL_INIT> {
//   dataKitId: string;
// }
// interface CreateModelStartedAction extends Action<typeof MODEL_START> {
//   dataKitId: string;
// }
// interface ModelCreatedAction extends Action<typeof MODEL_CREATED> {
//   dataKitId: string;
//   modelId: number;
//   inputByName: { [key: string]: ItemWithNameAndId };
// }
// interface ModelStatusUpdatedAction extends Action<typeof MODEL_STATUS_UPDATED> {
//   dataKitId: string;
//   status: ModelStatus;
// }
// interface ModelDoneAction extends Action<typeof MODEL_DONE> {
//   dataKitId: string;
// }
// interface ModelErrorAction extends Action<typeof MODEL_ERROR> {
//   dataKitId: string;
// }

// interface ModelResetAction extends Action<typeof MODEL_RESET> {
//   dataKitId: string;
// }

// type ModelActions =
//   | CreateModelInitAction
//   | CreateModelStartedAction
//   | ModelCreatedAction
//   | ModelStatusUpdatedAction
//   | ModelDoneAction
//   | ModelErrorAction
//   | ModelResetAction;

// export const apiRootPath = (project: string) =>
//   `/api/v1/projects/${project}/context/entitymatching`;
// const createModelPath = (project: string) => `${apiRootPath(project)}`;
// const getModelStatusPath = (project: string, modelId: number) =>
//   `${apiRootPath(project)}/${modelId}`;
// const getListModelsPath = (project: string) => `${apiRootPath(project)}/list`;
// const updateModel = (project: string) => `${apiRootPath(project)}/update`;

// function updateStatus(dataKitId: string, status: ModelStatus) {
//   return {
//     type: MODEL_STATUS_UPDATED,
//     status,
//     dataKitId,
//   };
// }

// export function start(dataKitId: string) {
//   return (dispatch: ThunkDispatch<any, any, AnyAction>) => {
//     dispatch({ type: MODEL_INIT, dataKitId });
//     dispatch({
//       type: MODEL_START,
//       dataKitId,
//     });
//   };
// }

// export async function getAllModels() {
//   const { data } = await sdk.post(getListModelsPath(sdk.project), {
//     data: {
//       filter: {},
//     },
//   });
//   // const { data } = await sdk.get(apiRootPath(sdk.project));
//   return data;
// }

// export async function editModel(id: number, name: string, description: string) {
//   const response = await sdk.post(updateModel(sdk.project), {
//     data: {
//       items: [
//         {
//           id,
//           update: {
//             name: {
//               set: name,
//             },
//             description: {
//               set: description,
//             },
//           },
//         },
//       ],
//     },
//   });
//   return response;
// }

// export function entityMatchingFit(
//   dataKitId: string,
//   featureType: FeatureType,
//   trueMatches: TrueMatch[],
//   matchFields: any,
//   sources: any,
//   targets: any
// ) {
//   return async (
//     dispatch: ThunkDispatch<any, any, AnyAction>
//   ): Promise<number> => {
//     const inputByName: { [key: string]: ItemWithNameAndId } = {};

//     dispatch(start(dataKitId));
//     let modelData: any = {
//       ignoreMissingFields: true,
//       featureType,
//       matchFields,
//       sources,
//       targets,
//     };
//     if (trueMatches.length) {
//       modelData = { ...modelData, trueMatches };
//     }
//     return new Promise((resolve, reject) => {
//       sdk
//         .post(createModelPath(sdk.project), {
//           data: modelData,
//         })
//         .then((response) => {
//           const {
//             status: httpStatus,
//             data: { id, status: queueStatus },
//           } = response;

//           dispatch({
//             type: MODEL_CREATED,
//             modelId: id,
//             dataKitId,
//             inputByName,
//           });
//           dispatch(updateStatus(dataKitId, queueStatus));

//           if (httpStatus === 200) {
//             callUntilCompleted(
//               () => sdk.get(getModelStatusPath(sdk.project, parseInt(id, 10))),
//               (data) => data.status === 'Completed' || data.status === 'Failed',
//               (data) => {
//                 dispatch({ type: MODEL_DONE, id, dataKitId });
//                 if (data.status === 'Failed') {
//                   dispatch({
//                     type: MODEL_ERROR,
//                     dataKitId,
//                   });
//                   reject();
//                 } else {
//                   resolve(id);
//                 }
//               },
//               (data) => {
//                 dispatch(updateStatus(dataKitId, data.status));
//               },
//               () => {
//                 dispatch(updateStatus(dataKitId, 'Failed'));
//                 dispatch({ type: MODEL_ERROR, dataKitId });
//                 reject();
//               }
//             );
//           } else {
//             dispatch({ type: MODEL_ERROR, dataKitId });
//             reject();
//           }
//         })
//         .catch(() => {
//           dispatch({ type: MODEL_ERROR, dataKitId });
//           reject();
//         });
//     });
//   };
// }

// export function resetModel(dataKitId: string) {
//   return {
//     type: MODEL_RESET,
//     dataKitId,
//   };
// }

// export interface ItemWithNameAndId {
//   id: number;
//   name: string;
// }

// export interface ModelState {
//   running: boolean;
//   id?: number;
//   status: ModelStatus;
//   done: boolean;
//   error: boolean;
// }

// export const defaultState: ModelState = Object.freeze({
//   running: false,
//   id: undefined,
//   status: 'New',
//   done: false,
//   error: false,
// });

// interface ModelStore {
//   [dataKitId: string]: ModelState;
// }

// export default function reducer(
//   state: ModelStore = {},
//   action: ModelActions
// ): ModelStore {
//   return producer(state, (draft) => {
//     const id = action.dataKitId || -1;
//     switch (action.type) {
//       case MODEL_INIT: {
//         draft[id] = {
//           ...defaultState,
//           ...draft[id],
//         };
//         break;
//       }

//       case MODEL_START: {
//         draft[id] = {
//           ...draft[id],
//           running: true,
//           done: false,
//           error: false,
//           status: 'Scheduled',
//         };
//         break;
//       }

//       case MODEL_CREATED: {
//         draft[id].id = action.modelId;
//         break;
//       }

//       case MODEL_STATUS_UPDATED: {
//         draft[id].status = action.status;
//         break;
//       }

//       case MODEL_DONE: {
//         draft[id].running = false;
//         draft[id].done = true;
//         break;
//       }

//       case MODEL_RESET: {
//         draft[id] = {
//           ...defaultState,
//         };
//         break;
//       }

//       case MODEL_ERROR: {
//         draft[id].running = false;
//         draft[id].error = true;
//         draft[id].status = 'Failed';
//         break;
//       }
//     }
//   });
// }

// export const getModelFactory = (id: string) =>
//   createSelector(
//     (state: RootState) => state.contextualization.models[id],
//     (model) => model || defaultState
//   );
