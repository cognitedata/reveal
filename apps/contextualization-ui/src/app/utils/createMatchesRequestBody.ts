import { MatchItem } from '@fusion/contextualization';
import { random } from 'lodash';

import { ManualMatch } from '../types';

export const createMatchesRequestBody = (
  manualMatches: {
    [key: string]: ManualMatch;
  },
  advancedJoinExternalId: string | undefined
) => {
  if (advancedJoinExternalId === undefined) {
    return [];
  }

  const currentDate = new Date().toISOString();

  return Object.values(manualMatches).reduce(
    (matchItems: MatchItem[], { originExternalId, matchedInstance }) => {
      if (matchedInstance && matchedInstance.value) {
        matchItems.push({
          externalId: `match-${random(1, 12031259120139120)}-${currentDate}`,
          advancedJoinExternalId: advancedJoinExternalId,
          originExternalId: originExternalId,
          linkedExternalId: matchedInstance.value,
        });
      }
      /*
      * This is disabled as the backend doesn't support this.
      else if (shouldNotMatch === true) {
        matchItems.push({
          externalId: `match-${random(1, 12031259120139120)}-${currentDate}`,
          advancedJoinExternalId: advancedJoinExternalId,
          originExternalId: originExternalId,
          linkedExternalId: 'shouldNotMatch',
        });
      }
      */
      return matchItems;
    },
    []
  );
};
