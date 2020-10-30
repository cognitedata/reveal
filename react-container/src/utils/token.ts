import { retrieveAuthResult } from './persistance';

export const getLoginToken = () => {
  const persistedAuthResult = retrieveAuthResult();

  return persistedAuthResult ? persistedAuthResult.accessToken : undefined;
};
