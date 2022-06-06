import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export function getSignedUrl(id: string) {
  // externalId => string, internalId => num (needs conversion using '+)
  return getCogniteSDKClient()
    .files.getDownloadUrls([{ externalId: id }])
    .then((result: any) => result[0].downloadUrl)
    .catch(() => {
      const num: number = +id; // convert from string to num'

      // just incase there is no externalId (thanks testing)
      return getCogniteSDKClient()
        .files.getDownloadUrls([{ id: num }])
        .then((result: any) => result[0].downloadUrl);
    });
}
