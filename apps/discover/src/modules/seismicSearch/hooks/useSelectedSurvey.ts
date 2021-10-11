import { useSelectedSurveys } from 'modules/seismicSearch/selectors';

import { useSurvey } from './useSurveys';

/*
 * Get the current survey from the UI state
 * and return it's data object.
 *
 */
export const useSelectedSurvey = () => {
  const selectedSurveyIds = useSelectedSurveys();

  if (selectedSurveyIds) {
    return useSurvey(selectedSurveyIds[0]);
  }

  return { error: true, data: undefined };
};
