// import { Action } from 'redux';
// import { FileInfo } from '@cognite/sdk';
import { CogniteAnnotation } from '@cognite/annotations';
import { ApiCall } from '../sdk-builder/types';

export type AnnotationsState = {
  byFileId: { [key: string]: any };
  byAssetId: { [key: string]: any };
};

// ---------------
// OLD
// ---------------

export interface AnnotationResult extends ApiCall {
  annotations: CogniteAnnotation[];
}
export interface LinkedFilesResult extends ApiCall {
  fileIds: number[];
}

export interface LinkedFilesByIdStore {
  [key: number]: LinkedFilesResult;
}
export interface AnnotationByIdStore {
  [key: number]: AnnotationResult;
}

export interface AnnotationsStore {
  byFileId: AnnotationByIdStore;
  byAssetId: LinkedFilesByIdStore;
}

// [todo]

// interface ListFileLinkedToAssetAction
//   extends Action<typeof LIST_FILES_LINKED_TO_ASSET> {
//   assetId: number;
// }

// interface ListFileLinkedToAssetErrorAction
//   extends Action<typeof LIST_FILES_LINKED_TO_ASSET_ERROR> {
//   assetId: number;
// }

// interface ListFileLinkedToAssetDoneAction
//   extends Action<typeof LIST_FILES_LINKED_TO_ASSET_DONE> {
//   assetId: number;
//   files: FileInfo[];
// }
