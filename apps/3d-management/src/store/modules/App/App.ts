import { combineReducers } from 'redux';
import { AppState } from './types';

export const SELECT_MODEL = 'app/SET_SELECTED_MODELS';
export const SET_MODEL_TABLE_STATE = 'app/SET_MODEL_TABLE_STATE';

type SelectedModels = AppState['selectedModels'];

const selectedModels = (
  state: SelectedModels = [],
  action: { type: string; payload: SelectedModels }
): SelectedModels => {
  switch (action.type) {
    case SELECT_MODEL:
      return action.payload;
    default:
      return state;
  }
};

type ModelTable = AppState['modelTableState'];

const modelTableState = (
  state: ModelTable = { filters: { modelNameFilter: '' } },
  action: { type: string; payload: ModelTable }
): ModelTable => {
  switch (action.type) {
    case SET_MODEL_TABLE_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const setSelectedModels = (payload: SelectedModels) => async (
  dispatch
) => dispatch({ type: SELECT_MODEL, payload });

export const setModelTableState = (payload: ModelTable) => async (dispatch) =>
  dispatch({ type: SET_MODEL_TABLE_STATE, payload });

export default combineReducers({
  selectedModels,
  modelTableState,
});
