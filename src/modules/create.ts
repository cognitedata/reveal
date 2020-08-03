import produce from 'immer';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { UploadFileMetadataResponse } from '@cognite/sdk';
import { UploadFile } from 'antd/lib/upload/interface';
import UploadGCS from '@cognite/gcs-browser-upload';
import { RootState } from 'reducers/index';
import { trackTimedUsage } from 'utils/Metrics';
import { retrieve as retrieveFunctions } from 'modules/retrieve';
import { callUntilCompleted } from 'helpers';
import sdk from 'sdk-singleton';

const UPLOAD_FILE = 'functions/UPLOAD_FILE';
const UPLOAD_FILE_DONE = 'functions/UPLOAD_FILE_DONE';
const UPLOAD_FILE_ERROR = 'functions/UPLOAD_FILE_ERROR';
const CREATE = 'functions/CREATE';
const CREATE_DONE = 'functions/CREATE_DONE';
const CREATE_ERROR = 'functions/CREATE_ERROR';
const CREATE_RESET = 'functions/CREATE_RESET';

// TODO: Move out all upload file functions
export const GCSUploader = (
  file: Blob | UploadFile,
  uploadUrl: string,
  callback: (info: any) => void = () => {}
) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'datastudio-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};

interface UploadFileAction extends Action<typeof UPLOAD_FILE> {
  file: UploadFile;
}

interface UploadFileDoneAction extends Action<typeof UPLOAD_FILE_DONE> {
  fileId: number;
}

interface UploadFileErrorAction extends Action<typeof UPLOAD_FILE_ERROR> {
  file: UploadFile;
}

interface CreateStartedAction extends Action<typeof CREATE> {
  functionName: string;
  description: string;
  apiKey: string;
  owner: string;
  externalId: string;
  secrets: {};
}

interface CreateDoneAction extends Action<typeof CREATE_DONE> {
  functionName: string;
}

interface CreateErrorAction extends Action<typeof CREATE_ERROR> {
  functionName: string;
  errorMessage: string;
}

interface CreateResetAction extends Action<typeof CREATE_RESET> {}

type UploadFileActions =
  | UploadFileAction
  | UploadFileDoneAction
  | UploadFileErrorAction;

type CreateActions =
  | CreateStartedAction
  | CreateDoneAction
  | CreateErrorAction
  | CreateResetAction;

export const uploadFile = (file: UploadFile) => async (
  dispatch: ThunkDispatch<any, any, UploadFileActions>
) => {
  dispatch({
    type: UPLOAD_FILE,
    file,
  });
  const timer = trackTimedUsage('Functions.UploadFile');

  // upload zip to cdf
  try {
    const fileMetadata = (await sdk.files.upload({
      name: file.name,
      source: 'Datastudio',
    })) as UploadFileMetadataResponse;
    const { uploadUrl, id } = fileMetadata;
    if (!uploadUrl || !id) {
      dispatch({
        type: UPLOAD_FILE_ERROR,
        file,
      });
      timer.stop({ success: false });
      return;
    }
    const currentUpload = await GCSUploader(file, uploadUrl, (info: any) => {
      file.response = info;
      file.percent = (info.uploadedBytes / info.totalBytes) * 100;
    });
    try {
      await currentUpload.start();
    } catch (e) {
      dispatch({
        type: UPLOAD_FILE_ERROR,
        file,
      });
      timer.stop({ success: false });
      return;
    }

    dispatch({
      type: UPLOAD_FILE_DONE,
      fileId: id,
    });

    timer.stop({ success: true, fileId: id });
  } catch (e) {
    dispatch({
      type: UPLOAD_FILE_ERROR,
      file,
    });
    timer.stop({ success: false });
  }
};

export const createFunction = (
  functionName: string,
  description: string,
  apiKey: string,
  owner: string,
  externalId: string,
  secrets: {}
) => async (
  dispatch: ThunkDispatch<any, any, CreateActions>,
  getState: () => RootState
) => {
  const { fileId } = getState().create.fileInfo;
  // Do not Create function if the file was not uploaded
  if (!fileId) {
    dispatch({
      type: CREATE_ERROR,
      functionName,
      errorMessage: 'Unable to find file',
    });
    return;
  }

  dispatch({
    type: CREATE,
    functionName,
    description,
    apiKey,
    owner,
    externalId,
    secrets,
  });
  const timer = trackTimedUsage('Functions.Create', {
    name: functionName,
    hasDescription: !!description,
    hasApiKey: !!apiKey,
    hasOwner: !!owner,
    hasExternalId: !!externalId,
    hasSecrets: Object.keys(secrets).length > 0,
  });

  try {
    // create function
    const response = await sdk.post(
      `/api/playground/projects/${sdk.project}/functions`,
      {
        data: {
          items: [
            {
              name: functionName,
              fileId,
              apiKey,
              description,
              owner,
              externalId,
              secrets,
            },
          ],
        },
      }
    );
    if (response.status !== 201) {
      dispatch({
        type: CREATE_ERROR,
        functionName,
        errorMessage: 'Unable to create function',
      });
      timer.stop({ success: false });
      return;
    }

    // update store
    await dispatch(retrieveFunctions([], true));

    dispatch({
      type: CREATE_DONE,
      functionName,
    });

    timer.stop({ success: true });

    // update function
    const newFunctionId = response.data.items[0].id;
    callUntilCompleted(
      () =>
        sdk.get(
          `/api/playground/projects/${sdk.project}/functions/${newFunctionId}`
        ),
      data => {
        return data.status === 'Ready' || data.status === 'Failed';
      },
      async () => {
        await dispatch(retrieveFunctions([], true));
      },
      async () => {
        await dispatch(retrieveFunctions([], true));
      },
      () => {},
      10000
    );
  } catch (e) {
    dispatch({
      type: CREATE_ERROR,
      functionName,
      errorMessage: e.message,
    });
    timer.stop({ success: false });
  }
};
export const createFunctionReset = () => async (
  dispatch: ThunkDispatch<any, any, CreateActions>
) => {
  dispatch({
    type: CREATE_RESET,
  });
};

interface CreateFunctionStore {
  name?: string;
  description?: string;
  apiKey?: string;
  owner?: string;
  externalId?: string;
  secrets?: {};
  fileInfo: {
    file?: UploadFile;
    uploading?: boolean;
    done?: boolean;
    error?: boolean;
    fileId?: number;
  };
  creating?: boolean;
  done?: boolean;
  error?: boolean;
  errorMessage?: string;
}
const defaultCreateFunctionStore = { fileInfo: {} };

export default function reducer(
  state: CreateFunctionStore = defaultCreateFunctionStore,
  action: CreateActions | UploadFileActions
): CreateFunctionStore {
  return produce(state, draft => {
    switch (action.type) {
      case UPLOAD_FILE: {
        draft.fileInfo.uploading = true;
        draft.fileInfo.file = action.file;
        break;
      }
      case UPLOAD_FILE_DONE: {
        draft.fileInfo.uploading = false;
        draft.fileInfo.done = true;
        draft.fileInfo.fileId = action.fileId;
        break;
      }
      case UPLOAD_FILE_ERROR: {
        draft.fileInfo.uploading = false;
        draft.fileInfo.error = true;
        break;
      }
      case CREATE: {
        draft.name = action.functionName;
        draft.description = action.description;
        draft.apiKey = action.apiKey;
        draft.owner = action.owner;
        draft.externalId = action.externalId;
        draft.secrets = action.secrets;
        draft.creating = true;
        break;
      }
      case CREATE_DONE: {
        draft.creating = false;
        draft.done = true;
        draft.error = false;
        break;
      }
      case CREATE_ERROR: {
        draft.creating = false;
        draft.error = true;
        draft.errorMessage = action.errorMessage;
        break;
      }
      case CREATE_RESET: {
        draft.name = undefined;
        draft.description = undefined;
        draft.apiKey = undefined;
        draft.owner = undefined;
        draft.externalId = undefined;
        draft.fileInfo = {};
        draft.creating = undefined;
        draft.done = undefined;
        draft.error = undefined;
        draft.errorMessage = undefined;
        break;
      }
    }
  });
}

export const selectUploadFileState = (state: RootState) => {
  const {
    create: {
      fileInfo: { uploading, done, error },
    },
  } = state;
  return { uploading, done, error };
};
export const selectCreateFunctionState = (state: RootState) => {
  const {
    create: { creating, done, error, errorMessage },
  } = state;
  return { creating, done, error, errorMessage };
};
export const selectCreateFunctionFields = (state: RootState) => {
  const {
    create: { name, description, apiKey, fileInfo: file, externalId, secrets },
  } = state;
  return { name, description, apiKey, file, externalId, secrets };
};

export const stuffForUnitTests = { GCSUploader };
