import { Identifier, Wellbore } from '@cognite/sdk-wells';

export const toIdentifierWithMatchingId = (
  matchingId: Wellbore['matchingId']
): Identifier => {
  return { matchingId };
};
