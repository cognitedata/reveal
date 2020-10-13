import { createAction } from 'redux-actions';
import { combineReducers } from 'redux';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification } from 'utils';

// Constants
export const REQUEST_MODELS = 'model/REQUEST_MODELS';
export const CREATED_MODEL = 'model/CREATED_MODEL';
export const RECEIVE_MODELS = 'model/RECEIVE_MODELS';
export const DELETED_MODEL = 'model/DELETE_MODELS';
export const RENAME_MODEL = 'model/RENAME_MODEL';
export const CLEAR_SAVED_MODELS = 'model/CLEAR_SAVED_MODELS';

// Reducer
const isLoading = (state = false, action) => {
  switch (action.type) {
    case REQUEST_MODELS:
      return true;
    case RECEIVE_MODELS:
      return false;
    default:
      return state;
  }
};

const data = (state = {}, action) => {
  switch (action.type) {
    case CLEAR_SAVED_MODELS:
      return {};
    case RECEIVE_MODELS:
      return {
        ...state,
        ...action.payload,
      };
    case CREATED_MODEL:
      return {
        ...state,
        items: [...state.items, action.payload[0]],
      };
    case DELETED_MODEL: {
      return {
        items: state.items.filter(
          (model) => model.id !== action.payload.modelId
        ),
      };
    }
    case RENAME_MODEL: {
      // changes state but only changes the items
      return {
        ...state,
        items: state.items.map((oldModel) => {
          // return the same objects except when the model Id is the same as the changed one
          if (oldModel.id === action.payload.modelId) {
            const temp = { ...oldModel, name: action.payload.modelName };

            return temp;
          }
          return oldModel;
        }),
      };
    }
    default:
      return state;
  }
};

export default combineReducers({
  isLoading,
  data,
});

// Action creators
export const requestModels = createAction(REQUEST_MODELS);
export const receiveModels = createAction(RECEIVE_MODELS);
export const createdModel = createAction(CREATED_MODEL);
export const deleteModel = createAction(DELETED_MODEL);
export const renameModel = createAction(RENAME_MODEL);
export const clearLocalModels = createAction(CLEAR_SAVED_MODELS);

// Actions
export const fetchModels = () => async (dispatch) => {
  dispatch(requestModels());
  const models = await sdk.models3D.list().autoPagingToArray({ limit: -1 });
  dispatch(receiveModels({ items: models }));
};

export const createNewModel = (payload) => async (dispatch) => {
  if (payload.modelName === undefined) {
    throw new Error('modelName is required!');
  }

  try {
    const model = await sdk.models3D.create([{ name: payload.modelName }]);
    return dispatch(createdModel(model));
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not create a model',
    });
  }
};

export const deleteExistingModel = (payload) => async (dispatch) => {
  if (payload.modelId === undefined) {
    throw new Error('modelId is required!');
  }

  try {
    await sdk.models3D.delete([{ id: payload.modelId }]);
    // delete API call returns an empty body, using original api call
    return dispatch(deleteModel(payload));
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not delete a model',
    });
  }
};

export const changeModelName = (payload) => async (dispatch) => {
  if (payload.modelId === undefined) {
    throw new Error('modelid is required!');
  } else if (payload.modelName === undefined) {
    throw new Error('modelName is required!');
  }

  try {
    await sdk.models3D.update([
      {
        id: payload.modelId,
        update: { name: { set: payload.modelName } },
      },
    ]);

    return dispatch(renameModel(payload));
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not rename a model',
    });
  }
};

export const actions = {
  fetchModels,
  createNewModel,
  deleteExistingModel,
  changeModelName,
  clearLocalModels,
};
