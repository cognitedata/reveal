import { ManualMatch } from '../types';

export const getAllManualMatchesDefined = (manualMatches?: {
  [key: string]: ManualMatch;
}) =>
  manualMatches &&
  Object.values(manualMatches).every(
    ({ linkedExternalId, shouldNotMatch }) =>
      linkedExternalId !== undefined || shouldNotMatch === true
  );

export const getAllManualMatchesNotDefined = (manualMatches?: {
  [key: string]: ManualMatch;
}) =>
  manualMatches &&
  Object.values(manualMatches).every(
    ({ linkedExternalId, shouldNotMatch }) =>
      linkedExternalId === undefined &&
      (shouldNotMatch === false || shouldNotMatch === undefined)
  );
