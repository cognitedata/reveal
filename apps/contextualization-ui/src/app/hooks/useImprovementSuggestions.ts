import {
  useCurrentView,
  useGetSuggestImprovementsJob,
  useRetrieveInstances,
} from '@fusion/contextualization';

import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useImprovementSuggestions = (jobId: string) => {
  const view = useCurrentView();

  const suggestImprovementsJobResults = useGetSuggestImprovementsJob(jobId);
  const { data: { improvementSuggestions: suggestions } = {} } =
    suggestImprovementsJobResults;

  const { data } = useRetrieveInstances(
    view?.space,
    view?.externalId,
    view?.version,
    suggestions
  );

  const originInstances = convertToInternalModelInstance(
    data,
    view?.space,
    view?.externalId,
    view?.version
  );

  return { suggestImprovementsJobResults, originInstances };
};
