import { ManualMatch } from '../types';

export const getAllManualMatchesDefined = (manualMatches?: {
  [key: string]: ManualMatch;
}) =>
  manualMatches &&
  Object.values(manualMatches).every(
    ({ matchedInstance, shouldNotMatch }) =>
      matchedInstance !== undefined || shouldNotMatch === true
  );

export const getAllManualMatchesNotDefined = (manualMatches?: {
  [key: string]: ManualMatch;
}) => {
  if (!manualMatches) {
    return true;
  }
  return Object.values(manualMatches).every(
    ({ matchedInstance, shouldNotMatch }) =>
      matchedInstance === undefined &&
      (shouldNotMatch === false || shouldNotMatch === undefined)
  );
};
