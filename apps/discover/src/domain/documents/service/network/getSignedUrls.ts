import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const getSignedUrls = (valueList: string[]) => {
  // externalId => string, internalId => num (needs conversion using '+)
  const externalIdList = valueList.map((val) => {
    return { externalId: val };
  });
  return getCogniteSDKClient()
    .files.getDownloadUrls(externalIdList)
    .catch(() => {
      const internalIdList = valueList.map((val) => {
        const num: number = +val; // convert from string to num'
        return { id: num };
      });
      return getCogniteSDKClient().files.getDownloadUrls(internalIdList);
    });
};
