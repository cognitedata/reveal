import { createAction } from 'redux-actions';
import { combineReducers } from 'redux';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { fireErrorNotification } from 'src/utils';

// Constants
export const REQUEST_REVISIONS = 'revisions/REQUEST_REVISIONS';
export const RECEIVE_REVISIONS = 'revisions/RECEIVE_REVISIONS';
export const CLEAR_REVISIONS = 'revisions/CLEAR_REVISIONS';
export const REQUEST_REVISION_BY_ID = 'revisions/REQUEST_REVISION_BY_ID';
export const RECEIVE_REVISION_BY_ID = 'revisions/RECEIVE_REVISION_BY_ID';
export const CREATED_REVISION = 'revisions/CREATED_REVISION';
export const UPDATE_REVISION = 'revisions/UPDATE_REVISION';
export const DELETE_REVISION = 'revisions/DELETE_REVISION';
export const FETCH_REVISION_LOGS = 'revisions/FETCH_REVISION_LOGS';

// Helpers
const addRevisionToState = (state, modelId, revision) => {
  const index = state.modelMap.indexOf(modelId);
  return {
    ...state,
    items: state.items.map((el, i) => {
      if (i !== index) {
        return el;
      }
      return {
        ...el,
        items: [revision, ...el.items],
      };
    }),
  };
};

// Reducer
const isLoading = (state = false, action) => {
  switch (action.type) {
    case REQUEST_REVISIONS:
    case REQUEST_REVISION_BY_ID:
      return true;
    case RECEIVE_REVISIONS:
    case RECEIVE_REVISION_BY_ID:
      return false;
    default:
      return state;
  }
};

const addExtendedRevision = (payload, state) => {
  const modelId = Number(payload.modelId);
  const revisionId = Number(payload.revisionId);
  if (!state.modelMap.includes(payload.modelId)) {
    return {
      ...state,
      items: [...state.items, { items: [payload.revision] }],
      modelMap: [...state.modelMap, modelId],
      extended: { ...state.extended, [modelId]: [revisionId] },
    };
  }
  const indx = state.modelMap.indexOf(payload.modelId);
  const newItems = state.items.slice();
  newItems[indx].items = newItems[indx].items.map((el) => {
    if (el.id !== revisionId) {
      return el;
    }
    return payload.revision;
  });
  // can't see extended being used anywhere. Is it safe to delete?
  return {
    ...state,
    items: newItems,
    extended: {
      ...state.extended,
      [modelId]: uniqWith([...state.extended[modelId], revisionId], isEqual),
    },
  };
};

/**
 * @param {{ revisions: CursorAndAsyncIterator<Revision3D, Revision3D[]>, modelId: number }} payload
 * @param state
 * @returns {*}
 */
const addRevisions = (payload, state) => {
  const modelId = Number(payload.modelId);
  if (state.modelMap.includes(modelId)) {
    return {
      ...state,
      items: state.items.map((el, i) => {
        if (i === state.modelMap.indexOf(modelId)) {
          return payload.revisions;
        }
        return el;
      }),
      modelMap: uniqWith([...state.modelMap, modelId], isEqual),
      loaded: uniqWith([...state.loaded, modelId], isEqual),
      extended: { ...state.extended, [modelId]: [] },
    };
  }
  return {
    ...state,
    items: [...state.items, payload.revisions],
    modelMap: [...state.modelMap, modelId],
    loaded: [...state.loaded, modelId],
    extended: { ...state.extended, [modelId]: [] },
  };
};

const removeRevisionFromState = (state, modelId, revisionId) => {
  const revIndexForThisModel = state.modelMap.indexOf(Number(modelId));

  const items = state.items.map((revisions, index) => {
    if (index === revIndexForThisModel) {
      return {
        items: revisions.items.filter(
          (revision) => revision.id !== Number(revisionId)
        ),
      };
    }

    return revisions;
  });

  return {
    ...state,
    items,
  };
};

const defaultDataState = {
  modelMap: [],
  extended: {},
  loaded: [],
  items: [],
  logs: {},
};

const data = (state = defaultDataState, action) => {
  switch (action.type) {
    case UPDATE_REVISION:
      return addRevisions(action.payload, state);
    case RECEIVE_REVISIONS:
      return addRevisions(action.payload, state);
    case CLEAR_REVISIONS:
      return defaultDataState;
    case RECEIVE_REVISION_BY_ID:
      return addExtendedRevision(action.payload, state);
    case CREATED_REVISION:
      return addRevisionToState(
        state,
        action.payload.modelId,
        action.payload.revision
      );
    case DELETE_REVISION:
      return removeRevisionFromState(
        state,
        action.payload.modelId,
        action.payload.revisionId
      );
    case FETCH_REVISION_LOGS:
      return {
        ...state,
        logs: {
          ...state.logs,
          [action.payload.revisionId]: action.payload.logs,
        },
      };
    default:
      return state;
  }
};

export default combineReducers({
  isLoading,
  data,
});

// Action creators
export const requestRevisions = createAction(REQUEST_REVISIONS);
export const receiveRevisions = createAction(RECEIVE_REVISIONS);
export const createdRevision = createAction(CREATED_REVISION);
export const requestRevisionById = createAction(REQUEST_REVISION_BY_ID);
export const receiveRevisionById = createAction(RECEIVE_REVISION_BY_ID);
export const clearingRevisions = createAction(CLEAR_REVISIONS);
export const updatingRevision = createAction(UPDATE_REVISION);
export const deleteRevisionById = createAction(DELETE_REVISION);

export const fetchRevisions = (payload) => async (dispatch) => {
  dispatch(requestRevisions);
  if (payload.modelId === undefined) {
    throw new Error('modelId is required!');
  }
  const revisions = await sdk.revisions3D.list(payload.modelId);
  dispatch(receiveRevisions({ revisions, modelId: payload.modelId }));
};

export const clearRevisions = () => async (dispatch) => {
  dispatch(clearingRevisions());
};

export const fetchRevisionById = (payload) => async (dispatch) => {
  dispatch(requestRevisionById);
  if (payload.modelId === undefined) {
    throw new Error('modelId is required!');
  } else if (payload.revisionId === undefined) {
    throw new Error('revisionId is required!');
  }

  const revision = await sdk.revisions3D.retrieve(
    payload.modelId,
    payload.revisionId
  );

  dispatch(
    receiveRevisionById({
      revision,
      modelId: payload.modelId,
      revisionId: payload.revisionId,
    })
  );
};

export const createNewRevision = (payload) => async (dispatch) => {
  if (payload.modelId === undefined) {
    throw new Error('model id is required!');
  } else if (payload.fileId === undefined) {
    throw new Error('fileId is required!');
  }
  try {
    const revisions = await sdk.revisions3D.create(payload.modelId, [
      { fileId: parseInt(payload.fileId, 10) },
    ]);
    return dispatch(
      createdRevision({
        revision: revisions[0],
        modelId: payload.modelId,
      })
    );
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not create a new revision',
    });
  }
};

export const updateRevision = (payload) => async (dispatch) => {
  if (payload.modelId === undefined) {
    throw new Error('model id is required!');
  } else if (payload.revisionId === undefined) {
    throw new Error('revisionId is required!');
  }

  const filter = ['published', 'rotation', 'camera', 'sceneThreedFileId'];

  try {
    const filtered = filter.reduce((accumulator, key) => {
      /* eslint-disable no-param-reassign */
      if (key in payload) accumulator[key] = { set: payload[key] };
      /* eslint-enable no-param-reassign */
      return accumulator;
    }, {});

    const revisions = await sdk.revisions3D.update(payload.modelId, [
      {
        id: payload.revisionId,
        update: {
          ...filtered,
        },
      },
    ]);

    return dispatch(
      updatingRevision({
        revisions: { items: [...revisions] },
        modelId: payload.modelId,
      })
    );
  } catch (error) {
    return fireErrorNotification({
      error,
      message:
        error.message || (error.responses && error.responses[0]?.message),
      description: `Error: Could not update revision's ${Object.keys(payload)
        .filter((el) => filter.includes(el))
        .join(', ')} values.`,
    });
  }
};

export const deleteRevision = (payload) => async (dispatch) => {
  if (payload.modelId === undefined) {
    throw new Error('model id is required!');
  } else if (payload.revisionId === undefined) {
    throw new Error('revisionId is required!');
  }

  try {
    const { modelId, revisionId } = payload;

    await sdk.revisions3D.delete(payload.modelId, [{ id: Number(revisionId) }]);

    return dispatch(
      deleteRevisionById({
        modelId,
        revisionId,
      })
    );
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not delete this revision',
    });
  }
};

export const fetchRevisionLogs = (payload) => async (dispatch) => {
  const { modelId, revisionId } = payload;
  if (payload.modelId === undefined) {
    throw new Error('model id is required!');
  } else if (payload.revisionId === undefined) {
    throw new Error('revisionId is required!');
  }

  try {
    const {
      data: { items },
    } = await sdk.get(
      `api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/logs?severity=3`
    );

    return dispatch({
      type: FETCH_REVISION_LOGS,
      payload: {
        revisionId,
        logs: items,
      },
    });
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Error: Could not fetch revision logs.',
    });
  }
};

export const actions = {
  fetchRevisions,
  fetchRevisionById,
  clearRevisions,
  createNewRevision,
  updateRevision,
};
