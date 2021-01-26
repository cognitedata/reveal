import { GCSUploader, getExternalFileInfo } from 'utils/files';
import {
  CogniteExternalId,
  ExternalFileInfo,
  FileInfo,
  FileUploadResponse,
} from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import { ApiClient, CdfClient } from 'utils';

import { insertSuite } from 'store/suites/thunks';
import { Board, Suite } from 'store/suites/types';
import * as actions from './actions';
import { BoardState } from './types';

export function setBoardState(client: CdfClient, board: BoardState) {
  return async (dispatch: RootDispatcher) => {
    const { imageFileId } = board as Board;
    if (imageFileId) {
      dispatch(retrieveFileInfo(client, imageFileId));
    } else {
      dispatch(actions.clearFile());
    }
    dispatch(actions.setBoard(board));
  };
}

export function saveForm(
  client: CdfClient,
  apiClient: ApiClient,
  filesUploadQueue: Map<string, File>,
  suite: Suite
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.formSaving());
    if (filesUploadQueue.size) {
      await dispatch(uploadFiles(client, filesUploadQueue));
    }
    await dispatch(insertSuite(client, apiClient, suite));
    dispatch(actions.formSaved());
  };
}

export function uploadFiles(
  client: CdfClient,
  filesUploadQueue: Map<string, File>
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.filesUpload());
    filesUploadQueue.forEach(async (file, boardKey) => {
      const fileInfo = getExternalFileInfo(file as File, boardKey);
      const { externalId } = fileInfo;
      try {
        await uploadFile(client, fileInfo, file);
        dispatch(
          actions.fileUploaded({
            boardKey,
            fileExternalId: externalId as string,
          })
        );
      } catch (e) {
        dispatch(actions.fileUploadError({ boardKey, error: e?.message }));
      }
    });
    dispatch(actions.filesUploaded());
  };
}

async function uploadFile(
  client: CdfClient,
  fileInfo: ExternalFileInfo,
  fileToUpload: File
) {
  const fileMetadata = (await client.uploadFile(
    fileInfo
  )) as FileUploadResponse;
  const { uploadUrl } = fileMetadata;
  if (!uploadUrl) {
    throw new Error('Unable to create file. Failed to get Upload URL.');
  }
  const currentUpload = await GCSUploader(fileToUpload, uploadUrl);
  return currentUpload.start();
}

export function retrieveFileInfo(
  client: CdfClient,
  fileExternalId: CogniteExternalId
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.retrieveFile());
    try {
      const fileInfo = (
        await client.retrieveFilesMetadata([fileExternalId])
      )[0] as FileInfo;
      dispatch(actions.retrievedFile(fileInfo));
    } catch (e) {
      dispatch(actions.fileRetrieveError(e));
    }
  };
}
