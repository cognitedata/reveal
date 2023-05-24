import { useSDK } from '@cognite/sdk-provider';
import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CogniteClient } from '@cognite/sdk';
import uniq from 'lodash/uniq';
import {
  AppContext,
  ExtendedAnnotation,
  isNotUndefined,
} from '@data-exploration-lib/core';
import {
  getFileExternalIdFromExtendedAnnotation,
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  isApprovedAnnotation,
  isAssetAnnotation,
  isExtendedLocalAnnotation,
} from '../../utils';

const CREATING_APP = 'data-exploration-components';
const CREATING_VERSION_SEM_VER = '1.0.0';

export const persistAssetIds = async (
  sdk: CogniteClient,
  annotations: ExtendedAnnotation[]
) => {
  const approvedAnnotations = annotations.filter((annotation) =>
    isApprovedAnnotation(annotation)
  );
  const fileIds = uniq(
    approvedAnnotations
      .map(getFileIdFromExtendedAnnotation)
      .filter(isNotUndefined)
  ).map((id) => ({ id }));
  const fileExternalIds = uniq(
    approvedAnnotations
      .map(getFileExternalIdFromExtendedAnnotation)
      .filter(isNotUndefined)
  ).map((externalId) => ({ externalId }));

  const fileIdsEither = [...fileIds, ...fileExternalIds];

  if (fileIdsEither.length === 0) {
    return;
  }

  // Old code here
  // https://github.com/cognitedata/cognite-annotations/blob/0d22f229a3e5caac92916abc6f0450135e00de43/typescript/src/ContextAnnotationUtils.ts#L28-L87

  const assetIds = uniq(
    approvedAnnotations
      .filter(isAssetAnnotation)
      .map(getResourceIdFromExtendedAnnotation)
  ).filter(isNotUndefined);

  if (assetIds.length === 0) {
    return;
  }

  return sdk.files.update(
    fileIdsEither.map((fileIdEither) => ({
      ...fileIdEither,
      update: {
        assetIds: {
          add: assetIds,
        },
      },
    }))
  );
};

export const useCreateAnnotation = (options: any) => {
  const context = useContext(AppContext);
  const email = context?.userInfo?.email || 'UNKNOWN';
  const sdk = useSDK();
  const { mutate } = useMutation(async (annotation: ExtendedAnnotation) => {
    if (!isExtendedLocalAnnotation(annotation)) {
      throw new Error('Attempted to create annotation that is not local');
    }

    const annotationCreationPromise = sdk.annotations.create([
      {
        status: 'approved',
        creatingApp: CREATING_APP,
        creatingAppVersion: CREATING_VERSION_SEM_VER,
        creatingUser: email, // TOOD: Confirm
        annotatedResourceType: annotation.metadata.annotatedResourceType,
        annotationType: annotation.metadata.annotationType,
        annotatedResourceId: annotation.metadata.annotatedResourceId,
        data: annotation.metadata.data,
      },
    ]);

    const fileAssetUpdatePromise = persistAssetIds(sdk, [annotation]);

    return Promise.all([annotationCreationPromise, fileAssetUpdatePromise]);
  }, options);
  return mutate;
};
