import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

export const getLabels = () => {
  return getCogniteSDKClient().labels.list({
    filter: {},
  });
};
