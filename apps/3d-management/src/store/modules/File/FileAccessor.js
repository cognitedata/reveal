import { createAction } from 'redux-actions';
import { combineReducers } from 'redux';

import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { fireErrorNotification } from 'src/utils';

// Constants
export const REQUEST_FILES = 'model/REQUEST_FILES';
export const RECEIVE_FILES = 'model/RECEIVE_FILES';
export const GET_DOWNLOAD_LINK = 'model/GET_DOWNLOAD_LINK';
export const RECEIVE_UPLOAD_URL = 'model/RECEIVE_UPLOAD_URL';

const defaultThumbnailDataState = {
  items: [],
};

// Reducer
const isLoading = (state = false, action) => {
  switch (action.type) {
    case REQUEST_FILES:
      return true;
    case RECEIVE_FILES:
      return false;
    default:
      return state;
  }
};

const data = (state = {}, action) => {
  switch (action.type) {
    case RECEIVE_FILES:
      return {
        ...state,
        ...action.payload,
      };
    case RECEIVE_UPLOAD_URL:
      return {
        ...state,
        ...action.payload.url,
      };
    default:
      return state;
  }
};

const thumbnails = (state = defaultThumbnailDataState, action) => {
  switch (action.type) {
    case GET_DOWNLOAD_LINK:
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    default:
      return state;
  }
};

export default combineReducers({
  isLoading,
  data,
  thumbnails,
});

// Action creators
export const requestFiles = createAction(REQUEST_FILES);
export const receiveFiles = createAction(RECEIVE_FILES);
export const getDownloadLink = createAction(GET_DOWNLOAD_LINK);
export const receiveUploadUrl = createAction(RECEIVE_UPLOAD_URL);

export const downloadThumbnail = (payload) => async (dispatch) => {
  if (payload.fileId === undefined) {
    throw new Error('fileId is required');
  }

  try {
    const urlCreator = URL.createObjectURL;

    return sdk.files3D
      .retrieve(payload.fileId)
      .then((res) => {
        const blob = new Blob([res], { type: 'image/png' });
        return urlCreator(blob);
      })
      .then((dataUrl) =>
        dispatch(
          getDownloadLink({
            fileId: payload.fileId,
            Url: dataUrl,
          })
        )
      );
  } catch (err) {
    return fireErrorNotification({
      code: err,
      description: 'Could not download thumbnail',
    });
  }
};

export const fetchUrlForUpload = (payload) => async (dispatch) => {
  const fileType = payload.fileType || 'application/octet-stream';
  if (payload.fileName === undefined) {
    throw new Error('fileName is required!');
  }

  try {
    const response = await sdk.files.upload({
      name: payload.fileName,
      mimeType: fileType,
      source: '3d-models',
      // directory is the time since the epoch began in milliseconds.
      // Collisions can happen if two requests happen on the same millisecond.
    });
    return dispatch(receiveUploadUrl({ url: response.uploadURL }));
  } catch (error) {
    return fireErrorNotification({
      error,
      message: 'Could not get upload url',
    });
  }
};

export const actions = {
  downloadThumbnail,
  fetchUrlForUpload,
};
