import produce from 'immer';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from 'reducers/index';
import { Function } from 'types/Types';
import { trackTimedUsage } from 'utils/Metrics';
import { retrieve as retrieveFunctions } from 'modules/retrieve';
import sdk from 'sdk-singleton';

const DELETE = 'functions/DELETE';
const DELETE_DONE = 'functions/DELETE_DONE';
const DELETE_ERROR = 'functions/DELETE_ERROR';

interface DeleteAction extends Action<typeof DELETE> {
  functionToDelete: Function;
}

interface DeleteDoneAction extends Action<typeof DELETE_DONE> {
  functionToDelete: Function;
}

interface DeleteErrorAction extends Action<typeof DELETE_ERROR> {
  functionToDelete: Function;
}

type DeleteActions = DeleteAction | DeleteDoneAction | DeleteErrorAction;

export function deleteFunction(functionToDelete: Function) {
  return async (dispatch: ThunkDispatch<any, any, DeleteActions>) => {
    dispatch({
      type: DELETE,
      functionToDelete,
    });

    const timer = trackTimedUsage('Functions.Delete', {
      name: functionToDelete.name,
      externalId: functionToDelete.externalId,
    });

    try {
      const response = await sdk.post(
        `/api/playground/projects/${sdk.project}/functions/delete`,
        {
          data: { items: [{ id: functionToDelete.id }] },
        }
      );
      if (response.status !== 200) {
        dispatch({
          type: DELETE_ERROR,
          functionToDelete,
        });
        timer.stop({ success: false });
        return;
      }

      // update store
      await dispatch(retrieveFunctions([], true));

      dispatch({
        type: DELETE_DONE,
        functionToDelete,
      });

      timer.stop({ success: true });
    } catch (e) {
      dispatch({
        type: DELETE_ERROR,
        functionToDelete,
      });
      timer.stop({ success: false });
    }
  };
}

interface DeleteFunctionStore {
  function?: Function;
  deleting?: boolean;
  error?: boolean;
}
const defaultDeleteFunctionStore = {};

export default function reducer(
  state: DeleteFunctionStore = defaultDeleteFunctionStore,
  action: DeleteActions
): DeleteFunctionStore {
  return produce(state, draft => {
    switch (action.type) {
      case DELETE: {
        draft.function = action.functionToDelete;
        draft.deleting = true;
        break;
      }
      case DELETE_DONE: {
        draft.deleting = false;
        draft.error = false;
        break;
      }
      case DELETE_ERROR: {
        draft.deleting = false;
        draft.error = true;
        break;
      }
    }
  });
}

export const selectDeleteFunctionState = (state: RootState) => {
  const {
    delete: { function: functionToDelete, deleting, error },
  } = state;
  return { functionToDelete, deleting, error };
};
