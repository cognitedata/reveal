import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const getFileMetadataByIds = (documentIds: number[]) => {
  return getCogniteSDKClient().files.retrieve(
    documentIds.map((document) => ({ id: document }))
  );
};
