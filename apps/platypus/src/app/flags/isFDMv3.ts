import { getCogniteSDKClient } from '../../environments/cogniteSdk';

export const isFDMv3 = (pathName = window.location.pathname) => {
  const sdkClient = getCogniteSDKClient();

  return !pathName.startsWith(`/${sdkClient.project}/data-models-previous`);
};
