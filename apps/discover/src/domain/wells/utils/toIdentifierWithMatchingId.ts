import { Identifier, Wellbore } from '@cognite/sdk-wells-v3';

export const toIdentifierWithMatchingId = (
  matchingId: Wellbore['matchingId']
): Identifier => {
  return { matchingId };
};
