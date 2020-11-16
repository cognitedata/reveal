import { createAction } from 'redux-actions';
import { combineReducers } from 'redux';

export const SELECT_MODEL = 'app/SET_SELECTED_MODELS';
export const SET_MODEL_TABLE_STATE = 'app/SET_MODEL_TABLE_STATE';

export const selectModels = createAction(SELECT_MODEL);

const selectedModels = (state = [], action) => {
  switch (action.type) {
    case SELECT_MODEL:
      return action.payload;
    default:
      return state;
  }
};

const modelTableState = (
  state = { filters: { modelNameFilter: '' } },
  action
) => {
  switch (action.type) {
    case SET_MODEL_TABLE_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const setSelectedModels = (payload) => async (dispatch) =>
  dispatch(selectModels(payload));

export const setModelTableState = (payload) => async (dispatch) =>
  dispatch({ type: SET_MODEL_TABLE_STATE, payload });

export default combineReducers({
  selectedModels,
  modelTableState,
});
