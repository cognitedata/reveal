import { APP_STATE_VERSION } from '@vision/utils/localStorage/LocalStorage';

import sdk from '@cognite/cdf-sdk-singleton';

export const validatePersistedState = (
  project: string,
  appStateVersion: number
): boolean => {
  const currentProject = sdk.project;

  return project === currentProject && appStateVersion === APP_STATE_VERSION;
};
