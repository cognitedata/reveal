import { getUrlParameters } from '@fusion/contextualization';

// We filter on externalId because there is no endpoint to get the number of saved manual matches for a specific advanced join
export const filterOnAdvancedJoinsExternalId = (savedManualMatches: any) => {
  const { advancedJoinExternalId } = getUrlParameters();
  const matches = savedManualMatches?.filter(
    (match: { advancedJoinExternalId: string }) =>
      match.advancedJoinExternalId === advancedJoinExternalId
  );
  return matches || [];
};
