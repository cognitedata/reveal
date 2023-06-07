import { STORAGE_PROVIDER_CONSTANTS } from '@platypus/platypus-core';
import { isFDMv3 } from '@platypus-app/flags';

export const getKeyForDataModel = (
  dataModelSpace: string,
  dataModelId: string,
  key: string
) => {
  // include "v2" in key if we're on FDM V2, otherwise don't include FDM version
  const keyParts = (isFDMv3() ? [] : ['v2']).concat([
    dataModelSpace,
    dataModelId,
    key,
  ]);

  return keyParts.join(STORAGE_PROVIDER_CONSTANTS.DELIMITER);
};

export const getLocalDraftKey = (
  dataModelSpace: string,
  dataModelId: string
) => {
  return getKeyForDataModel(dataModelSpace, dataModelId, 'drafts');
};
