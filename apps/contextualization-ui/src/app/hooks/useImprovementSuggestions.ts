import {
  getUrlParameters,
  useGetSuggestImprovementsJob,
  useRetrieveInstances,
} from '@fusion/contextualization';

import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useImprovementSuggestions = (jobId: string) => {
  const { space, type, versionNumber } = getUrlParameters();

  const SuggestImprovementsJobResults = useGetSuggestImprovementsJob(jobId);
  const { data: { improvementSuggestions: suggestions } = {} } =
    SuggestImprovementsJobResults;

  const { data } = useRetrieveInstances(
    space,
    type,
    versionNumber,
    suggestions
  );

  const originInstances = convertToInternalModelInstance(
    data,
    space,
    type,
    versionNumber
  );

  return { SuggestImprovementsJobResults, originInstances };
};
