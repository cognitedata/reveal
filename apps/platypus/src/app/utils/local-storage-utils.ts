import { STORAGE_PROVIDER_CONSTANTS } from '@platypus/platypus-core';

export const getKeyForDataModel = (
  dataModelSpace: string,
  dataModelId: string,
  key: string
) => {
  // include "v2" in key if we're on FDM V2, otherwise don't include FDM version
  // @ts-ignore
  const keyParts = [].concat([dataModelSpace, dataModelId, key]);

  return keyParts.join(STORAGE_PROVIDER_CONSTANTS.DELIMITER);
};

export const getLocalDraftKey = (
  dataModelSpace: string,
  dataModelId: string
) => {
  return getKeyForDataModel(dataModelSpace, dataModelId, 'drafts');
};
